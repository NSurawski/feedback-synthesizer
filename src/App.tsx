import { useState, useCallback } from 'react';
import { MessageSquareText, Sparkles, Key, AlertCircle, Loader2, Clock, Trash2, Sun, Moon, Play } from 'lucide-react';
import type { AnalysisReport, PartialReport, PipelineStep } from './types';
import { runPipeline } from './pipeline';
import { sampleFeedback } from './sampleData';
import { PIPELINE_STEPS, PipelineProgress } from './components/PipelineProgress';
import { ThemeCard } from './components/ThemeCard';
import { FeatureRequestList } from './components/FeatureRequestList';
import { Report } from './components/Report';
import { getSavedReports, saveReport, deleteReport, type SavedReport } from './reportHistory';
import { useTheme } from './useTheme';
import { demoReport } from './demoReport';

function maskApiKey(key: string): string {
  if (key.length <= 11) return key.slice(0, 3) + '•'.repeat(key.length - 3);
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

function estimateCost(entries: number): string {
  // Haiku 4.5: $0.80/MTok in, $4.00/MTok out
  // Sonnet 4: ~$3/MTok in, ~$15/MTok out
  // 2 Haiku calls (ingest + extract), 3 Sonnet calls (cluster + score + synthesize)
  const haikuIn  = (2000 + entries * 50)  * 0.80  / 1_000_000;
  const haikuOut = (400  + entries * 30)  * 4.00  / 1_000_000;
  const sonnetIn  = (3000 + entries * 80) * 3.00  / 1_000_000;
  const sonnetOut = (1600 + entries * 30) * 15.00 / 1_000_000;
  const total = haikuIn + haikuOut + sonnetIn + sonnetOut;
  if (total < 0.01) return '< $0.01';
  return `~$${total.toFixed(2)}`;
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('feedback-synth-key') || '');
  const [isEditingKey, setIsEditingKey] = useState(() => !localStorage.getItem('feedback-synth-key'));
  const [feedback, setFeedback] = useState('');
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [partialReport, setPartialReport] = useState<PartialReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>(() => getSavedReports());

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
    setPartialReport(null);

    try {
      const result = await runPipeline(
        feedback,
        apiKey,
        (step) => setPipelineStep(step as PipelineStep),
        (partial) => setPartialReport(partial)
      );
      setReport(result);
      setPartialReport(null);
      saveReport(result, feedback);
      setSavedReports(getSavedReports());
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
    setPartialReport(null);
    setPipelineStep('idle');
    setError(null);
  }, []);

  const handleViewSavedReport = useCallback((saved: SavedReport) => {
    setReport(saved.report);
    setPipelineStep('complete');
    setError(null);
  }, []);

  const handleDeleteReport = useCallback((id: string) => {
    deleteReport(id);
    setSavedReports(getSavedReports());
  }, []);

  const handleViewDemo = useCallback(() => {
    setReport(demoReport);
    setPipelineStep('complete');
    setError(null);
  }, []);

  const entryCount = feedback
    .split('\n')
    .filter((line) => line.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <MessageSquareText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Feedback Synthesizer</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Agentic AI feedback analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="https://nsurawski.github.io/PM-Portfolio/"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              &larr; Portfolio
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Input or Report */}
        {!report && pipelineStep === 'idle' && (
          <>
            {/* Demo CTA */}
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">See it in action</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View a pre-analyzed report from 30 sample feedback entries — no API key needed.
                  </p>
                </div>
                <button
                  onClick={handleViewDemo}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <Play size={16} />
                  View Demo Report
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gray-50 px-3 text-gray-400 dark:bg-gray-950 dark:text-gray-500">or analyze your own feedback</span>
              </div>
            </div>

            {/* API Key */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <Key size={16} className="text-gray-400 dark:text-gray-500" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Anthropic API Key</label>
              </div>
              {isEditingKey ? (
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  onBlur={() => { if (apiKey.trim()) setIsEditingKey(false); }}
                  placeholder="sk-ant-..."
                  autoFocus
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    {maskApiKey(apiKey)}
                  </span>
                  <button
                    onClick={() => setIsEditingKey(true)}
                    className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Edit key
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Your key is stored locally and never sent to any server except Anthropic's API.
              </p>
            </div>

            {/* Feedback Input */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Paste your feedback</h2>
                <button
                  onClick={handleLoadSample}
                  className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <Sparkles size={14} />
                  Try with sample data
                </button>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    if (feedback.trim() && apiKey.trim()) handleAnalyze();
                  }
                }}
                placeholder="Paste support tickets, app reviews, survey responses, or interview notes here. One entry per line works best."
                rows={12}
                className="w-full resize-y rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-500"
              />
              {entryCount > 0 && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {entryCount} {entryCount === 1 ? 'entry' : 'entries'} detected
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {estimateCost(entryCount)} estimated
                  </p>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!feedback.trim() || !apiKey.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
            >
              <Sparkles size={18} />
              Analyze Feedback
              <kbd className="ml-1 rounded border border-blue-400/40 bg-blue-700/40 px-1.5 py-0.5 text-[10px] font-mono font-medium">⌘↵</kbd>
            </button>

            {/* How it works */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">How it works</h3>
              <div className="grid gap-4 sm:grid-cols-5">
                {PIPELINE_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
                        <Icon size={18} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{step.label}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
                Each step is a separate AI agent call — the pipeline thinks autonomously through
                your feedback.
              </p>
            </div>

            {/* Recent Reports */}
            {savedReports.length > 0 && (
              <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400 dark:text-gray-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Reports</h3>
                </div>
                <div className="space-y-2">
                  {savedReports.map((saved) => (
                    <div
                      key={saved.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <button
                        onClick={() => handleViewSavedReport(saved)}
                        className="flex-1 text-left"
                      >
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {saved.report.themes.length} themes · {saved.report.totalEntries} entries
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-md dark:text-gray-400">
                          {saved.feedbackPreview}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(saved.savedAt).toLocaleDateString()} at{' '}
                          {new Date(saved.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </button>
                      <button
                        onClick={() => handleDeleteReport(saved.id)}
                        className="ml-3 shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                        title="Delete report"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Pipeline Running */}
        {pipelineStep !== 'idle' && pipelineStep !== 'complete' && pipelineStep !== 'error' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-2 text-center font-semibold text-gray-900 dark:text-gray-100">
                Analyzing your feedback...
              </h2>
              <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
                The AI agent is working through {entryCount} entries in 5 autonomous steps.
              </p>
              <PipelineProgress currentStep={pipelineStep} />
            </div>

            {/* Progressive results — show themes and feature requests while synthesis runs */}
            {partialReport?.themes && (
              <div className="animate-fadeIn space-y-8">
                <div>
                  <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                    Themes ({partialReport.themes.length})
                  </h2>
                  <div className="space-y-4">
                    {partialReport.themes.map((theme, i) => (
                      <ThemeCard key={theme.name} theme={theme} rank={i + 1} />
                    ))}
                  </div>
                </div>

                {partialReport.featureRequests && (
                  <FeatureRequestList requests={partialReport.featureRequests} />
                )}

                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  <Loader2 size={16} className="animate-spin" />
                  Generating executive summary...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error during pipeline */}
        {pipelineStep === 'error' && error && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              <AlertCircle size={16} />
              {error}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                className="flex-1 rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
              >
                Retry
              </button>
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Report */}
        {report && pipelineStep === 'complete' && (
          <div className="space-y-6">
            <Report report={report} />
            <button
              onClick={handleReset}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Analyze New Feedback
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
        Built by Nicole Surawski · Powered by Claude API ·{' '}
        <a href="https://nsurawski.github.io/PM-Portfolio/" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          View Portfolio
        </a>
      </footer>
    </div>
  );
}
