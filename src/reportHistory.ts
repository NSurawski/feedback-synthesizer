import type { AnalysisReport } from './types';

export interface SavedReport {
  id: string;
  report: AnalysisReport;
  feedbackPreview: string;
  savedAt: string;
}

const STORAGE_KEY = 'feedback-synth-reports';
const MAX_REPORTS = 10;

export function getSavedReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReport(report: AnalysisReport, rawFeedback: string): SavedReport {
  const saved: SavedReport = {
    id: crypto.randomUUID(),
    report,
    feedbackPreview: rawFeedback.slice(0, 120).trim() + (rawFeedback.length > 120 ? '...' : ''),
    savedAt: new Date().toISOString(),
  };

  const existing = getSavedReports();
  const updated = [saved, ...existing].slice(0, MAX_REPORTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return saved;
}

export function deleteReport(id: string): void {
  const updated = getSavedReports().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
