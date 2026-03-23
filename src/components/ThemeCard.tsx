import { useState } from 'react';
import { ChevronDown, ChevronUp, Quote } from 'lucide-react';
import type { Theme } from '../types';

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

export function ThemeCard({ theme, rank }: { theme: Theme; rank: number }) {
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
