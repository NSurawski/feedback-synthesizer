import { describe, it, expect } from 'vitest';
import { reportToMarkdown } from '../reportMarkdown';
import type { AnalysisReport } from '../types';

const baseReport: AnalysisReport = {
  totalEntries: 42,
  analyzedAt: '2024-01-15T10:00:00.000Z',
  executiveSummary: ['Users love the speed', 'Onboarding needs work'],
  themes: [
    {
      name: 'Performance',
      count: 20,
      percentage: 48,
      actionability: 'high',
      sentiment: { positive: 15, negative: 3, neutral: 2 },
      quotes: ['It flies!', 'Super fast'],
      entries: [],
    },
  ],
  featureRequests: [
    { description: 'Dark mode', count: 8, quotes: ['Please add dark mode'] },
    { description: 'Export to CSV', count: 1, quotes: [] },
  ],
};

describe('reportToMarkdown', () => {
  it('includes the report title', () => {
    expect(reportToMarkdown(baseReport)).toContain('# Feedback Analysis Report');
  });

  it('includes total entry count', () => {
    expect(reportToMarkdown(baseReport)).toContain('42 feedback entries');
  });

  it('includes each executive summary bullet', () => {
    const md = reportToMarkdown(baseReport);
    expect(md).toContain('- Users love the speed');
    expect(md).toContain('- Onboarding needs work');
  });

  it('includes theme name and metadata', () => {
    const md = reportToMarkdown(baseReport);
    expect(md).toContain('### 1. Performance');
    expect(md).toContain('20 entries · 48% · Actionability: high');
  });

  it('includes theme quotes as blockquotes', () => {
    const md = reportToMarkdown(baseReport);
    expect(md).toContain('> "It flies!"');
    expect(md).toContain('> "Super fast"');
  });

  it('includes feature requests section', () => {
    const md = reportToMarkdown(baseReport);
    expect(md).toContain('## Feature Requests');
    expect(md).toContain('**Dark mode** (8 mentions)');
  });

  it('pluralizes "mention" correctly for count of 1', () => {
    expect(reportToMarkdown(baseReport)).toContain('**Export to CSV** (1 mention)');
  });

  it('includes the first quote for a feature request', () => {
    expect(reportToMarkdown(baseReport)).toContain('> "Please add dark mode"');
  });

  it('omits feature requests section when list is empty', () => {
    const report = { ...baseReport, featureRequests: [] };
    expect(reportToMarkdown(report)).not.toContain('## Feature Requests');
  });

  it('omits theme quotes block when quotes array is empty', () => {
    const report: AnalysisReport = {
      ...baseReport,
      featureRequests: [],
      themes: [{ ...baseReport.themes[0], quotes: [] }],
    };
    expect(reportToMarkdown(report)).not.toContain('> "');
  });
});
