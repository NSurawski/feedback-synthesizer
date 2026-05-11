import type { AnalysisReport } from './types';

export function reportToMarkdown(report: AnalysisReport): string {
  const date = new Date(report.analyzedAt).toLocaleDateString();
  const lines: string[] = [
    '# Feedback Analysis Report',
    '',
    `*Based on ${report.totalEntries} feedback entries · Analyzed ${date}*`,
    '',
    '## Executive Summary',
    '',
    ...report.executiveSummary.map((s) => `- ${s}`),
    '',
    `## Themes (${report.themes.length})`,
  ];

  report.themes.forEach((theme, i) => {
    lines.push('', `### ${i + 1}. ${theme.name}`);
    lines.push(
      `**${theme.count} entries · ${theme.percentage}% · Actionability: ${theme.actionability}**`,
    );
    lines.push(
      `Sentiment — positive: ${theme.sentiment.positive} · negative: ${theme.sentiment.negative} · neutral: ${theme.sentiment.neutral}`,
    );
    if (theme.quotes.length > 0) {
      lines.push('');
      theme.quotes.forEach((q) => lines.push(`> "${q}"`));
    }
  });

  if (report.featureRequests.length > 0) {
    lines.push('', '## Feature Requests', '');
    report.featureRequests.forEach((fr, i) => {
      lines.push(`${i + 1}. **${fr.description}** (${fr.count} mention${fr.count !== 1 ? 's' : ''})`);
      if (fr.quotes.length > 0) lines.push(`   > "${fr.quotes[0]}"`);
    });
  }

  return lines.join('\n');
}
