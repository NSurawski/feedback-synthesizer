export interface FeedbackEntry {
  id: number;
  text: string;
  themes: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  isFeatureRequest: boolean;
}

export interface Theme {
  name: string;
  count: number;
  percentage: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  actionability: 'high' | 'medium' | 'low';
  quotes: string[];
  entries: FeedbackEntry[];
}

export interface FeatureRequest {
  description: string;
  count: number;
  quotes: string[];
}

export interface AnalysisReport {
  executiveSummary: string[];
  themes: Theme[];
  featureRequests: FeatureRequest[];
  totalEntries: number;
  analyzedAt: string;
}

export interface PartialReport {
  themes?: Theme[];
  featureRequests?: FeatureRequest[];
  totalEntries?: number;
}

export type PipelineStep =
  | 'idle'
  | 'ingesting'
  | 'clustering'
  | 'scoring'
  | 'extracting'
  | 'synthesizing'
  | 'complete'
  | 'error';
