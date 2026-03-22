import { useState, useCallback } from 'react';
import { MessageSquareText, Sparkles, ChevronDown, ChevronUp, Quote, Lightbulb, BarChart3, Key, AlertCircle, CheckCircle2, Loader2, ClipboardList, Zap, Search, FileText, ArrowRight } from 'lucide-react';
import type { AnalysisReport, PipelineStep, Theme } from './types';
import { runPipeline } from './pipeline';
import { sampleFeedback } from './sampleData';

const PIPELINE_STEPS: { key: PipelineStep; label: string; icon: typeof Sparkles }[] = [
  { key: 'ingesting', label: 'Parsing entries', icon: ClipboardList },
  { key: 'clustering', label: 'Clustering themes', icon: Search },
  { key: 'scoring', label: 'Scoring & ranking', icon: BarChart3 },
  { key: 'extracting', label: 'Extracting quotes', icon: Quote },
  { key: 'synthesizing', label: 'Synthesizing report', icon: FileText },
];

function getStepIndex(step: PipelineStep): number {
  return PIPELINE_STEPS.findIndex((s) => s.key === step);
}

function SentimentBar({ sentiment }: { sentiment: Theme['sentiment'] }) {
  const total = sentiment.positive + sentiment.negative + sentiment.neutral;
  if (total === 0) return null;
  const pos = Math.round((sentiment.positive / total) * 100);
  const neg = Math.round((sentiment.negative / total) * 100);
  const neu = 100 - pos - neg;

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        {neg > 0 && (
          <div className="bg-red-400" style={{ width: `${neg}%` }} />
        )}
        {neu > 0 && (
          <div className="bg-gray-300" style={{ width: `${neu}%` }} />
        )}
        {pos > 0 && (
          <div className="bg-emerald-400" style={{ width: `${pos}%` }} />
        )}
      </div>
      <span className="w-24 shrink-0 text-gray-500">
        {neg > 0 && <span className="text-red-500">{neg}%</span>}
        {neg > 0 && neu > 0 && ' · '}
        {neu > 0 && <span className="text-gray-400">{neu}%</span>}
        {(neg > 0 || neu > 0) && pos > 0 && ' · '}
        {pos > 0 && <span className="text-emerald-500">{pos}%</span>}
      </span>
    </div>
  );
}

function ThemeCard({ theme, rank }: { theme: Theme; rank: number }) {
  const [expanded, setExpanded] = useState(false);

  const actionabilityColor = {
    high: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            {rank}
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">{theme.name}</h3>
            <p className="text-sm text-gray-500">
              {theme.count} entries · {theme.percentage}% of feedback
            </p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${actionabilityColor[theme.actionability]}`}>
          {theme.actionability} actionability
        </span>
      </div>

      <div className="mb-3">
        <p className="mb-1 text-xs font-medium text-gray-400 uppercase">Sentiment</p>
        <SentimentBar sentiment={theme.sentiment} />
      </div>

      {theme.quotes.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-medium text-gray-400 uppercase">Top quotes</p>
          <div className="space-y-2">
            {theme.quotes.map((q, i) => (
              <div key={i} className="flex gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <Quote size={14} className="mt-0.5 shrink-0 text-blue-400" />
                <span className="italic">"{q}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {expanded ? 'Hide' : 'Show'} all {theme.count} entries
      </button>

      {expanded && (
        <div className="mt-3 max-h-60 space-y-1 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
          {theme.entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 py-1 text-sm text-gray-600">
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  entry.sentiment === 'positive'
                    ? 'bg-emerald-400'
                    : entry.sentiment === 'negative'
                      ? 'bg-red-400'
                      : 'bg-gray-300'
                }`}
              />
              {entry.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PipelineProgress({ currentStep }: { currentStep: PipelineStep }) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="mx-auto w-full max-w-xl py-8">
      <div className="flex items-center justify-between">
        {PIPELINE_STEPS.map((step, i) => {
          const isComplete = currentStep === 'complete' || i < currentIndex;
          const isCurrent = i === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 ${
                  isComplete
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'animate-pulse bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 size={20} />
                ) : isCurrent ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isComplete
                    ? 'text-emerald-600'
                    : isCurrent
                      ? 'text-blue-600'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Connecting line */}
      <div className="relative mx-6 -mt-[3.25rem] mb-8 h-0.5 bg-gray-200">
        <div
          className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-700"
          style={{
            width:
              currentStep === 'complete'
                ? '100%'
                : currentIndex >= 0
                  ? `${(currentIndex / (PIPELINE_STEPS.length - 1)) * 100}%`
                  : '0%',
          }}
        />
      </div>
    </div>
  );
}

function Report({ report }: { report: AnalysisReport }) {
  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Executive Summary</h2>
        </div>
        <ul className="space-y-3">
          {report.executiveSummary.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700">
              <ArrowRight size={16} className="mt-0.5 shrink-0 text-blue-500" />
              {insight}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-400">
          Based on {report.totalEntries} feedback entries · Analyzed{' '}
          {new Date(report.analyzedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Themes */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Themes ({report.themes.length})
        </h2>
        <div className="space-y-4">
          {report.themes.map((theme, i) => (
            <ThemeCard key={theme.name} theme={theme} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Feature Requests */}
      {report.featureRequests.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Zap size={20} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">
              Feature Requests ({report.featureRequests.length})
            </h2>
          </div>
          <div className="space-y-3">
            {report.featureRequests.map((req, i) => (
              <div
                key={i}
                className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{req.description}</p>
                  {req.quotes.length > 0 && (
                    <p className="mt-1 text-sm italic text-gray-500">
                      "{req.quotes[0]}"
                    </p>
                  )}
                </div>
                <span className="ml-4 shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                  {req.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('feedback-synth-key') || '');
  const [feedback, setFeedback] = useState('');
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem('feedback-synth-key', key);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Anthropic API key.');
      return;
    }
    if (!feedback.trim()) {
      setError('Please paste some feedback to analyze.');
      return;
    }

    setError(null);
    setReport(null);

    try {
      const result = await runPipeline(feedback, apiKey, (step) => {
        setPipelineStep(step as PipelineStep);
      });
      setReport(result);
    } catch (err) {
      setPipelineStep('error');
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    }
  }, [apiKey, feedback]);

  const handleLoadSample = useCallback(() => {
    setFeedback(sampleFeedback);
  }, []);

  const handleReset = useCallback(() => {
    setFeedback('');
    setReport(null);
    setPipelineStep('idle');
    setError(null);
  }, []);

  const entryCount = feedback
    .split('\n')
    .filter((line) => line.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <MessageSquareText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Feedback Synthesizer</h1>
              <p className="text-xs text-gray-500">Agentic AI feedback analysis</p>
            </div>
          </div>
          <a
            href="https://nsurawski.github.io/PM-Portfolio/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            &larr; Portfolio
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* API Key */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Anthropic API Key</label>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Your key is stored locally and never sent to any server except Anthropic's API.
          </p>
        </div>

        {/* Input or Report */}
        {!report && pipelineStep === 'idle' && (
          <>
            {/* Feedback Input */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Paste your feedback</h2>
                <button
                  onClick={handleLoadSample}
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                >
                  <Sparkles size={14} />
                  Try with sample data
                </button>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Paste support tickets, app reviews, survey responses, or interview notes here. One entry per line works best."
                rows={12}
                className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {entryCount > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {entryCount} {entryCount === 1 ? 'entry' : 'entries'} detected
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!feedback.trim() || !apiKey.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Sparkles size={18} />
              Analyze Feedback
            </button>

            {/* How it works */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">How it works</h3>
              <div className="grid gap-4 sm:grid-cols-5">
                {PIPELINE_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                        <Icon size={18} className="text-blue-600" />
                      </div>
                      <p className="text-xs font-medium text-gray-700">{step.label}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-xs text-gray-400">
                Each step is a separate AI agent call — the pipeline thinks autonomously through
                your feedback.
              </p>
            </div>
          </>
        )}

        {/* Pipeline Running */}
        {pipelineStep !== 'idle' && pipelineStep !== 'complete' && pipelineStep !== 'error' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-2 text-center font-semibold text-gray-900">
              Analyzing your feedback...
            </h2>
            <p className="mb-4 text-center text-sm text-gray-500">
              The AI agent is working through {entryCount} entries in 5 autonomous steps.
            </p>
            <PipelineProgress currentStep={pipelineStep} />
          </div>
        )}

        {/* Error during pipeline */}
        {pipelineStep === 'error' && error && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
            <button
              onClick={handleReset}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Report */}
        {report && pipelineStep === 'complete' && (
          <div className="space-y-6">
            <Report report={report} />
            <button
              onClick={handleReset}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Analyze New Feedback
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400">
        Built by Nicole Surawski · Powered by Claude API ·{' '}
        <a href="https://nsurawski.github.io/PM-Portfolio/" className="text-blue-500 hover:text-blue-700">
          View Portfolio
        </a>
      </footer>
    </div>
  );
}
