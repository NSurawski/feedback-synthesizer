import { useState, useCallback } from 'react';
import { MessageSquareText, Sparkles, Key, AlertCircle, Loader2 } from 'lucide-react';
import type { AnalysisReport, PartialReport, PipelineStep } from './types';
import { runPipeline } from './pipeline';
import { sampleFeedback } from './sampleData';
import { PIPELINE_STEPS, PipelineProgress } from './components/PipelineProgress';
import { ThemeCard } from './components/ThemeCard';
import { FeatureRequestList } from './components/FeatureRequestList';
import { Report } from './components/Report';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('feedback-synth-key') || '');
  const [feedback, setFeedback] = useState('');
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [partialReport, setPartialReport] = useState<PartialReport | null>(null);
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
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-2 text-center font-semibold text-gray-900">
                Analyzing your feedback...
              </h2>
              <p className="mb-4 text-center text-sm text-gray-500">
                The AI agent is working through {entryCount} entries in 5 autonomous steps.
              </p>
              <PipelineProgress currentStep={pipelineStep} />
            </div>

            {/* Progressive results — show themes and feature requests while synthesis runs */}
            {partialReport?.themes && (
              <div className="animate-fadeIn space-y-8">
                <div>
                  <h2 className="mb-4 text-lg font-bold text-gray-900">
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

                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
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
