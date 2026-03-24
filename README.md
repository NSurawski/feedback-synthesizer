# Agentic AI User Feedback Synthesizer

An agentic AI tool that ingests raw user feedback, clusters it into themes, scores by frequency and sentiment, extracts feature requests, and generates a prioritized insights report. Try the [live demo](https://nicolesurawski.github.io/feedback-synthesizer/) — no API key needed.

## Problem & Product Insight

Product Managers often spend hours manually reading qualitative user feedback from surveys, support tickets, or reviews. This process is:

- Time-consuming and inconsistent
- Difficult to prioritize which issues or features matter most
- Prone to human bias, making product decisions less confident

This project demonstrates how an **agentic AI workflow** can structure and summarize feedback, helping PMs quickly extract actionable insights and prioritize effectively.

## Approach & Decision Making

I designed this tool as a **multi-step agentic AI workflow** rather than a simple summarizer, so that it could autonomously:

- Cluster similar feedback into meaningful themes
- Extract key insights and recurring pain points
- Analyze sentiment to understand overall user perception
- Produce a structured output ready for decision-making

**Tradeoffs considered:**

- Clustering sometimes over-generalizes distinct feedback
- Human-in-the-loop validation could improve accuracy but wasn't included in this self-initiated project
- Prioritized clarity and workflow autonomy over full integration with live data sources

## Impact & Learnings

Even as a self-initiated project, this synthesizer demonstrates how agentic AI can:

- Reduce the time needed to process qualitative feedback from hours to minutes
- Highlight patterns and recurring themes that might be missed manually
- Provide PMs with structured insights that support prioritization decisions

**Key learning:**
Effective PM solutions don't just automate tasks — they also improve clarity and decision confidence. Designing autonomous workflows requires careful tradeoffs between accuracy, autonomy, and interpretability.

**Real-world PM use case:**
A PM could use this tool after collecting survey responses or support tickets to quickly identify patterns and prioritize next steps, making decisions faster and more confidently.

## Tech Stack

- **Frontend:** React 19 + TypeScript (strict) + Vite
- **Styling:** Tailwind CSS v4 with dark mode support
- **AI:** Anthropic Claude API (Sonnet for reasoning, Haiku for parsing)

## How It Works

The synthesizer runs as a 5-step agentic AI pipeline, where each step is a separate Claude API call:

1. **Ingest & Clean** — Parse raw text into individual feedback entries
2. **Classify & Cluster** — Group similar feedback into emergent themes with sentiment
3. **Score & Rank** — Rate actionability and sort by composite score
4. **Extract Quotes** — Select representative quotes and deduplicate feature requests
5. **Synthesize** — Generate an executive summary with prioritized insights

Steps 3 and 4 run in parallel for speed. Each step has automatic retry with exponential backoff for transient API errors.

## Features

- **Demo mode** — View a pre-built sample report instantly, no API key required
- **Progressive rendering** — Themes appear as they're ready, before the full report completes
- **Dark mode** — Toggle between light/dark themes, with system preference detection
- **Report caching** — Past reports are saved in localStorage so you can revisit without re-running
- **Copy & share** — Export the full report as formatted markdown

## Installation

**Step 1:** Clone the repository

```bash
git clone https://github.com/NSurawski/feedback-synthesizer.git
```

**Step 2:** Navigate into the project folder

```bash
cd feedback-synthesizer
```

**Step 3:** Install dependencies

```bash
npm install
```

**Step 4:** Run the development server

```bash
npm run dev
```

**Step 5:** Open the app in your browser — visit `http://localhost:5173` (or the URL shown in your terminal)

## Usage

1. Paste or type raw qualitative user feedback
2. Click **Analyze Feedback**
3. View structured themes, sentiment analysis, and prioritized insights
4. Explore feature requests and representative quotes

Or click **View Demo Report** to explore a sample analysis without an API key.

## Limitations & Next Steps

- Clustering can sometimes over-generalize distinct feedback
- No human-in-the-loop validation yet
- Future improvements:
  - Adjustable clustering sensitivity
  - Feedback tagging and filtering
  - Integration with live data sources (Zendesk, Intercom, etc.)

## Author

Built by Nicole Surawski as part of her transition into Product Management.
