import { useState } from 'react';
import { Lightbulb, ArrowRight, Copy, Check } from 'lucide-react';
import type { AnalysisReport } from '../types';
import { reportToMarkdown } from '../reportMarkdown';
import { ThemeCard } from './ThemeCard';
import { FeatureRequestList } from './FeatureRequestList';

export function Report({ report }: { report: AnalysisReport }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(reportToMarkdown(report)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-8">
      {/* Copy button */}
      <div className="flex justify-end">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy as Markdown'}
        </button>
      </div>

      {/* Executive Summary */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb size={20} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Executive Summary</h2>
        </div>
        <ul className="space-y-3">
          {report.executiveSummary.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
              <ArrowRight size={16} className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400" />
              {insight}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          Based on {report.totalEntries} feedback entries · Analyzed{' '}
          {new Date(report.analyzedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Themes */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
          Themes ({report.themes.length})
        </h2>
        <div className="space-y-4">
          {report.themes.map((theme, i) => (
            <ThemeCard key={theme.name} theme={theme} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Feature Requests */}
      <FeatureRequestList requests={report.featureRequests} />
    </div>
  );
}
