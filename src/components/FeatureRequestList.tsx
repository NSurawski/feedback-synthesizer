import { Zap } from 'lucide-react';
import type { FeatureRequest } from '../types';

export function FeatureRequestList({ requests }: { requests: FeatureRequest[] }) {
  if (requests.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Zap size={20} className="text-amber-500" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Feature Requests ({requests.length})
        </h2>
      </div>
      <div className="space-y-3">
        {requests.map((req, i) => (
          <div
            key={i}
            className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">{req.description}</p>
              {req.quotes.length > 0 && (
                <p className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">
                  "{req.quotes[0]}"
                </p>
              )}
            </div>
            <span className="ml-4 shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              {req.count}x
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
