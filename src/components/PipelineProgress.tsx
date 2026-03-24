import { CheckCircle2, Loader2, ClipboardList, Search, BarChart3, Quote, FileText } from 'lucide-react';
import type { PipelineStep } from '../types';

export const PIPELINE_STEPS: { key: PipelineStep; label: string; icon: typeof ClipboardList }[] = [
  { key: 'ingesting', label: 'Parsing entries', icon: ClipboardList },
  { key: 'clustering', label: 'Clustering themes', icon: Search },
  { key: 'scoring', label: 'Scoring & ranking', icon: BarChart3 },
  { key: 'extracting', label: 'Extracting quotes', icon: Quote },
  { key: 'synthesizing', label: 'Synthesizing report', icon: FileText },
];

export function getStepIndex(step: PipelineStep): number {
  return PIPELINE_STEPS.findIndex((s) => s.key === step);
}

export function PipelineProgress({ currentStep }: { currentStep: PipelineStep }) {
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
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
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
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Connecting line */}
      <div className="relative mx-6 -mt-[3.25rem] mb-8 h-0.5 bg-gray-200 dark:bg-gray-700">
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
