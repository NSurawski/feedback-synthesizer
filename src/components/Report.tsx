import { Lightbulb, ArrowRight } from 'lucide-react';
import type { AnalysisReport } from '../types';
import { ThemeCard } from './ThemeCard';
import { FeatureRequestList } from './FeatureRequestList';

export function Report({ report }: { report: AnalysisReport }) {
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
      <FeatureRequestList requests={report.featureRequests} />
    </div>
  );
}
