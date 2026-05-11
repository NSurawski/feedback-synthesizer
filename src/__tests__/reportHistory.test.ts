import { describe, it, expect, beforeEach } from 'vitest';
import { getSavedReports, saveReport, deleteReport } from '../reportHistory';
import type { AnalysisReport } from '../types';

const baseReport: AnalysisReport = {
  totalEntries: 10,
  analyzedAt: new Date().toISOString(),
  executiveSummary: ['Test insight'],
  themes: [],
  featureRequests: [],
};

beforeEach(() => {
  localStorage.clear();
});

describe('getSavedReports', () => {
  it('returns an empty array when storage is empty', () => {
    expect(getSavedReports()).toEqual([]);
  });

  it('returns an empty array when storage contains invalid JSON', () => {
    localStorage.setItem('feedback-synth-reports', 'not-json');
    expect(getSavedReports()).toEqual([]);
  });
});

describe('saveReport', () => {
  it('persists a report and returns it', () => {
    const saved = saveReport(baseReport, 'some feedback');
    expect(getSavedReports()).toHaveLength(1);
    expect(getSavedReports()[0].id).toBe(saved.id);
  });

  it('prepends new reports so the most recent is first', () => {
    const first = saveReport(baseReport, 'first');
    const second = saveReport(baseReport, 'second');
    const reports = getSavedReports();
    expect(reports[0].id).toBe(second.id);
    expect(reports[1].id).toBe(first.id);
  });

  it('truncates feedbackPreview to 120 chars with ellipsis', () => {
    const long = 'a'.repeat(200);
    const saved = saveReport(baseReport, long);
    expect(saved.feedbackPreview).toHaveLength(123); // 120 + '...'
    expect(saved.feedbackPreview.endsWith('...')).toBe(true);
  });

  it('does not add ellipsis when feedback is under 120 chars', () => {
    const short = 'short feedback';
    const saved = saveReport(baseReport, short);
    expect(saved.feedbackPreview).toBe(short);
  });

  it('caps stored reports at 10', () => {
    for (let i = 0; i < 12; i++) saveReport(baseReport, `feedback ${i}`);
    expect(getSavedReports()).toHaveLength(10);
  });
});

describe('deleteReport', () => {
  it('removes the report with the given id', () => {
    const saved = saveReport(baseReport, 'to delete');
    deleteReport(saved.id);
    expect(getSavedReports()).toHaveLength(0);
  });

  it('does not affect other reports when deleting one', () => {
    const a = saveReport(baseReport, 'keep');
    const b = saveReport(baseReport, 'delete');
    deleteReport(b.id);
    const remaining = getSavedReports();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(a.id);
  });

  it('is a no-op for a non-existent id', () => {
    saveReport(baseReport, 'keep');
    deleteReport('does-not-exist');
    expect(getSavedReports()).toHaveLength(1);
  });
});
