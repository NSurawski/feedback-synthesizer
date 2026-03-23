import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisReport, PartialReport, FeedbackEntry, Theme, FeatureRequest } from './types';

// Model tiering: use cheaper/faster Haiku for simple parsing tasks,
// Sonnet for complex reasoning (clustering, scoring, synthesis)
const MODEL_FAST = 'claude-haiku-4-5-20251001';
const MODEL_SMART = 'claude-sonnet-4-20250514';

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1000;

function createClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

function isRetryable(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    // Retry on rate limits, server errors, network issues, and overload
    if (msg.includes('rate limit') || msg.includes('429')) return true;
    if (msg.includes('500') || msg.includes('502') || msg.includes('503')) return true;
    if (msg.includes('overloaded') || msg.includes('capacity')) return true;
    if (msg.includes('network') || msg.includes('timeout') || msg.includes('fetch')) return true;
  }
  return false;
}

async function withRetry<T>(stepName: string, fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES && isRetryable(err)) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }
  const message = lastError instanceof Error ? lastError.message : 'Unknown error';
  throw new Error(`Pipeline failed at "${stepName}": ${message}`);
}

export async function runPipeline(
  rawText: string,
  apiKey: string,
  onStep: (step: string) => void,
  onPartialResult?: (partial: PartialReport) => void
): Promise<AnalysisReport> {
  const client = createClient(apiKey);

  // Step 1: Ingest & Clean
  onStep('ingesting');
  const entries = await withRetry('Parsing entries', () =>
    ingestAndClean(client, rawText)
  );

  // Step 2: Classify & Cluster
  onStep('clustering');
  const clustered = await withRetry('Clustering themes', () =>
    classifyAndCluster(client, entries)
  );

  // Steps 3 & 4 run in parallel — they both depend on step 2 but not each other
  onStep('scoring');
  const [scored, extractResult] = await Promise.all([
    withRetry('Scoring & ranking', () => scoreAndRank(client, clustered)),
    withRetry('Extracting quotes', () => extractQuotesAndRequests(client, clustered.entries)),
  ]);

  // Merge quotes from step 4 into scored themes from step 3
  onStep('extracting');
  const mergedThemes = mergeQuotesIntoThemes(scored, extractResult.themeQuotes);

  // Emit partial results — themes and feature requests are ready, summary is pending
  const totalEntries = new Set(mergedThemes.flatMap((t) => t.entries.map((e) => e.id))).size;
  onPartialResult?.({
    themes: mergedThemes,
    featureRequests: extractResult.featureRequests,
    totalEntries,
  });

  // Step 5: Synthesize
  onStep('synthesizing');
  const report = await withRetry('Synthesizing report', () =>
    synthesize(client, { themes: mergedThemes, featureRequests: extractResult.featureRequests })
  );

  onStep('complete');
  return report;
}

async function ingestAndClean(
  client: Anthropic,
  rawText: string
): Promise<string[]> {
  const response = await client.messages.create({
    model: MODEL_FAST,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a data processing agent. Parse the following raw user feedback into individual entries. Each entry should be a single piece of feedback from one user.

Rules:
- Split on newlines, bullet points, or numbered items
- Remove empty lines and duplicate entries
- Keep each entry as-is (don't summarize or rephrase)
- Return valid JSON only

Raw feedback:
${rawText}

Return a JSON array of strings, each being one feedback entry. Example:
["feedback 1", "feedback 2", "feedback 3"]

Return ONLY the JSON array, no other text.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse feedback entries');
  return JSON.parse(jsonMatch[0]);
}

async function classifyAndCluster(
  client: Anthropic,
  entries: string[]
): Promise<{ entries: FeedbackEntry[]; themeNames: string[] }> {
  const response = await client.messages.create({
    model: MODEL_SMART,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a feedback analysis agent. Classify each feedback entry into themes and determine sentiment.

Rules:
- Create 3-12 theme categories based on what emerges from the data (don't use predefined categories)
- Theme names should be short noun phrases (e.g., "onboarding confusion", "mobile performance", "missing integrations")
- Each entry can belong to 1-2 themes
- Sentiment is: "positive", "negative", or "neutral"
- Mark entries as feature requests if they ask for a new capability
- Merge near-duplicate themes (e.g., "slow loading" and "performance issues" should be one theme)

Feedback entries:
${JSON.stringify(entries)}

Return valid JSON in this exact format:
{
  "themes": ["theme1", "theme2", ...],
  "entries": [
    {"id": 0, "text": "original text", "themes": ["theme1"], "sentiment": "negative", "isFeatureRequest": false},
    ...
  ]
}

Return ONLY the JSON, no other text.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to classify feedback');
  const result = JSON.parse(jsonMatch[0]);
  return { entries: result.entries, themeNames: result.themes };
}

async function scoreAndRank(
  client: Anthropic,
  data: { entries: FeedbackEntry[]; themeNames: string[] }
): Promise<Theme[]> {
  const { entries, themeNames } = data;

  // Build themes from classified entries
  const themes: Theme[] = themeNames.map((name) => {
    const themeEntries = entries.filter((e) => e.themes.includes(name));
    const sentimentCounts = {
      positive: themeEntries.filter((e) => e.sentiment === 'positive').length,
      negative: themeEntries.filter((e) => e.sentiment === 'negative').length,
      neutral: themeEntries.filter((e) => e.sentiment === 'neutral').length,
    };

    return {
      name,
      count: themeEntries.length,
      percentage: Math.round((themeEntries.length / entries.length) * 100),
      sentiment: sentimentCounts,
      actionability: 'medium' as const,
      quotes: [],
      entries: themeEntries,
    };
  });

  // Use AI to score actionability
  const response = await client.messages.create({
    model: MODEL_SMART,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a product prioritization agent. For each theme, rate its actionability — how directly the feedback suggests a concrete product change.

Themes with entry counts and sentiment:
${JSON.stringify(
  themes.map((t) => ({
    name: t.name,
    count: t.count,
    sentiment: t.sentiment,
    sampleEntries: t.entries.slice(0, 3).map((e) => e.text),
  }))
)}

Return a JSON object mapping theme name to actionability level ("high", "medium", or "low"):
{"theme name": "high", "another theme": "low", ...}

High = feedback directly implies a specific product change
Medium = feedback points to a problem area but solution isn't obvious
Low = general sentiment without clear product implications

Return ONLY the JSON, no other text.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const actionability = JSON.parse(jsonMatch[0]);
    themes.forEach((t) => {
      if (actionability[t.name]) {
        t.actionability = actionability[t.name];
      }
    });
  }

  // Sort by composite score: frequency * actionability weight
  const actionabilityWeight = { high: 3, medium: 2, low: 1 };
  themes.sort(
    (a, b) =>
      b.count * actionabilityWeight[b.actionability] -
      a.count * actionabilityWeight[a.actionability]
  );

  return themes;
}

async function extractQuotesAndRequests(
  client: Anthropic,
  allEntries: FeedbackEntry[]
): Promise<{ themeQuotes: Record<string, string[]>; featureRequests: FeatureRequest[] }> {
  // Group entries by theme for quote extraction
  const themeMap: Record<string, string[]> = {};
  allEntries.forEach((e) => {
    e.themes.forEach((t) => {
      if (!themeMap[t]) themeMap[t] = [];
      themeMap[t].push(e.text);
    });
  });

  const response = await client.messages.create({
    model: MODEL_FAST,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a feedback analysis agent. Do two things:

1. For each theme, select the 2-3 most representative quotes from its entries.
2. Extract all feature requests into a deduplicated list with frequency counts.

Theme data:
${JSON.stringify(
  Object.entries(themeMap).map(([name, entries]) => ({ name, entries }))
)}

All entries marked as feature requests:
${JSON.stringify(allEntries.filter((e) => e.isFeatureRequest).map((e) => e.text))}

Return valid JSON:
{
  "themeQuotes": {
    "theme name": ["quote 1", "quote 2"],
    ...
  },
  "featureRequests": [
    {"description": "Dark mode support", "count": 1, "quotes": ["Please add dark mode!"]},
    ...
  ]
}

Return ONLY the JSON, no other text.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to extract quotes');

  const result = JSON.parse(jsonMatch[0]);
  return { themeQuotes: result.themeQuotes || {}, featureRequests: result.featureRequests || [] };
}

function mergeQuotesIntoThemes(
  themes: Theme[],
  themeQuotes: Record<string, string[]>
): Theme[] {
  return themes.map((t) => ({
    ...t,
    quotes: themeQuotes[t.name] || t.entries.slice(0, 2).map((e) => e.text),
  }));
}

async function synthesize(
  client: Anthropic,
  data: { themes: Theme[]; featureRequests: FeatureRequest[] }
): Promise<AnalysisReport> {
  const response = await client.messages.create({
    model: MODEL_SMART,
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a product insights agent. Write an executive summary (3-5 bullet points) synthesizing the key findings from this feedback analysis.

Themes (ranked by priority):
${JSON.stringify(
  data.themes.map((t) => ({
    name: t.name,
    count: t.count,
    percentage: t.percentage,
    sentiment: t.sentiment,
    actionability: t.actionability,
  }))
)}

Feature requests:
${JSON.stringify(data.featureRequests)}

Rules:
- Each bullet should be a complete, actionable insight (not just a theme label)
- Lead with the most impactful finding
- Quantify where possible (e.g., "X% of feedback mentions...")
- Frame insights in terms of product decisions, not just observations
- Keep each bullet to 1-2 sentences

Return a JSON array of strings:
["insight 1", "insight 2", "insight 3"]

Return ONLY the JSON array, no other text.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const summary = jsonMatch ? JSON.parse(jsonMatch[0]) : ['Analysis complete.'];

  const totalEntries = data.themes.reduce(
    (acc, t) => {
      t.entries.forEach((e) => acc.add(e.id));
      return acc;
    },
    new Set<number>()
  ).size;

  return {
    executiveSummary: summary,
    themes: data.themes,
    featureRequests: data.featureRequests,
    totalEntries,
    analyzedAt: new Date().toISOString(),
  };
}
