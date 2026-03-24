import type { AnalysisReport } from './types';

export const demoReport: AnalysisReport = {
  executiveSummary: [
    "Performance and reliability issues are the top concern — 23% of feedback mentions crashes, slow loading, or data loss, signaling an urgent need to invest in stability before new features.",
    "Feature requests for integrations (Slack, Google Calendar, CSV export) represent the largest cluster of actionable demand, with multiple users citing competitors as the benchmark.",
    "Onboarding and permissions confusion accounts for 17% of feedback, suggesting the first-run experience and access controls need simplification to reduce support load.",
    "Despite pain points, collaboration features and the recent dashboard redesign are generating strong positive sentiment — these are differentiators worth protecting in the roadmap.",
    "Security and accessibility gaps (no 2FA, no colorblind support) are blocking adoption for enterprise and accessibility-conscious users — relatively low-effort fixes with high trust impact."
  ],
  themes: [
    {
      name: "performance and reliability",
      count: 7,
      percentage: 23,
      sentiment: { positive: 0, negative: 6, neutral: 1 },
      actionability: "high",
      quotes: [
        "The loading times have gotten noticeably worse over the past month. Pages take 5+ seconds to load.",
        "The auto-save feature has lost my work twice now. I don't trust it anymore.",
        "The mobile app crashes every time I try to upload a photo."
      ],
      entries: [
        { id: 1, text: "Love the product overall but the mobile app crashes every time I try to upload a photo.", themes: ["performance and reliability"], sentiment: "negative", isFeatureRequest: false },
        { id: 10, text: "The loading times have gotten noticeably worse over the past month. Pages take 5+ seconds to load.", themes: ["performance and reliability"], sentiment: "negative", isFeatureRequest: false },
        { id: 14, text: "The file size limit of 10MB is way too low. I can't upload any of my design files.", themes: ["performance and reliability", "missing features"], sentiment: "negative", isFeatureRequest: true },
        { id: 20, text: "Why does the app log me out every 24 hours? So frustrating to have to sign in every single day.", themes: ["performance and reliability"], sentiment: "negative", isFeatureRequest: false },
        { id: 23, text: "The drag-and-drop feature doesn't work on Firefox. Only works on Chrome.", themes: ["performance and reliability"], sentiment: "negative", isFeatureRequest: false },
        { id: 28, text: "The auto-save feature has lost my work twice now. I don't trust it anymore.", themes: ["performance and reliability"], sentiment: "negative", isFeatureRequest: false },
        { id: 7, text: "The search function is basically useless. It doesn't find results unless you type the exact title.", themes: ["performance and reliability"], sentiment: "negative", isFeatureRequest: false }
      ]
    },
    {
      name: "missing integrations",
      count: 5,
      percentage: 17,
      sentiment: { positive: 0, negative: 4, neutral: 1 },
      actionability: "high",
      quotes: [
        "Why can't I integrate with Slack? Every other tool in our stack has Slack notifications.",
        "I've been asking for CSV export for 6 months now. This is a basic feature that every competitor has.",
        "Integration with Google Calendar would be a game changer."
      ],
      entries: [
        { id: 4, text: "I've been asking for CSV export for 6 months now. This is a basic feature that every competitor has.", themes: ["missing integrations"], sentiment: "negative", isFeatureRequest: true },
        { id: 6, text: "Why can't I integrate with Slack? Every other tool in our stack has Slack notifications.", themes: ["missing integrations"], sentiment: "negative", isFeatureRequest: true },
        { id: 15, text: "Can you add keyboard shortcuts? I'm a power user and having to click everything is slow.", themes: ["missing integrations", "missing features"], sentiment: "negative", isFeatureRequest: true },
        { id: 24, text: "I wish there was a way to set recurring tasks. I have to manually recreate the same tasks every week.", themes: ["missing integrations", "missing features"], sentiment: "negative", isFeatureRequest: true },
        { id: 27, text: "Integration with Google Calendar would be a game changer. Right now I have to manually sync everything.", themes: ["missing integrations"], sentiment: "neutral", isFeatureRequest: true }
      ]
    },
    {
      name: "onboarding and permissions",
      count: 5,
      percentage: 17,
      sentiment: { positive: 0, negative: 4, neutral: 1 },
      actionability: "high",
      quotes: [
        "The onboarding flow is really confusing. I had to watch a YouTube video just to figure out how to set up my first project.",
        "The permission system is confusing. I can't figure out how to give someone view-only access without them being able to edit."
      ],
      entries: [
        { id: 0, text: "The onboarding flow is really confusing. I had to watch a YouTube video just to figure out how to set up my first project.", themes: ["onboarding and permissions"], sentiment: "negative", isFeatureRequest: false },
        { id: 12, text: "Honestly, the API documentation is terrible. Took me 2 days to figure out authentication.", themes: ["onboarding and permissions"], sentiment: "negative", isFeatureRequest: false },
        { id: 17, text: "The notification system is overwhelming. I get pinged for every tiny change. Need better notification controls.", themes: ["onboarding and permissions"], sentiment: "negative", isFeatureRequest: true },
        { id: 19, text: "The permission system is confusing. I can't figure out how to give someone view-only access without them being able to edit.", themes: ["onboarding and permissions"], sentiment: "negative", isFeatureRequest: false },
        { id: 16, text: "I accidentally deleted a project and there's no way to recover it. Please add an undo/trash feature.", themes: ["onboarding and permissions", "missing features"], sentiment: "neutral", isFeatureRequest: true }
      ]
    },
    {
      name: "positive product experience",
      count: 7,
      percentage: 23,
      sentiment: { positive: 7, negative: 0, neutral: 0 },
      actionability: "low",
      quotes: [
        "The new dashboard redesign is beautiful. Really love the data visualization improvements.",
        "I switched from Competitor X specifically because of your collaboration features. They're the best in the market.",
        "LOVE the new template library. It saved me hours when setting up our team workspace."
      ],
      entries: [
        { id: 3, text: "Your customer support team was incredibly helpful when I had billing issues. Shoutout to Sarah!", themes: ["positive product experience"], sentiment: "positive", isFeatureRequest: false },
        { id: 5, text: "The new dashboard redesign is beautiful. Really love the data visualization improvements.", themes: ["positive product experience"], sentiment: "positive", isFeatureRequest: false },
        { id: 8, text: "I switched from Competitor X specifically because of your collaboration features. They're the best in the market.", themes: ["positive product experience"], sentiment: "positive", isFeatureRequest: false },
        { id: 13, text: "Your weekly email digest is actually really useful. One of the few product emails I actually read.", themes: ["positive product experience"], sentiment: "positive", isFeatureRequest: false },
        { id: 18, text: "LOVE the new template library. It saved me hours when setting up our team workspace.", themes: ["positive product experience"], sentiment: "positive", isFeatureRequest: false },
        { id: 21, text: "The reporting features are surprisingly good for a tool at this price point. Very impressed.", themes: ["positive product experience"], sentiment: "positive", isFeatureRequest: false },
        { id: 25, text: "Your product roadmap page gives me confidence that you're actively improving. Keep it up!", themes: ["positive product experience"], sentiment: "positive", isFeatureRequest: false }
      ]
    },
    {
      name: "pricing concerns",
      count: 1,
      percentage: 3,
      sentiment: { positive: 0, negative: 1, neutral: 0 },
      actionability: "medium",
      quotes: [
        "Pricing feels too expensive for small teams. We're 3 people and paying the same as a 20-person team."
      ],
      entries: [
        { id: 9, text: "Pricing feels too expensive for small teams. We're 3 people and paying the same as a 20-person team.", themes: ["pricing concerns"], sentiment: "negative", isFeatureRequest: false }
      ]
    },
    {
      name: "security and accessibility",
      count: 3,
      percentage: 10,
      sentiment: { positive: 1, negative: 2, neutral: 0 },
      actionability: "high",
      quotes: [
        "Please add two-factor authentication. We handle sensitive data and this is a security requirement for us.",
        "The color coding for priorities is not accessible for colorblind users. Please use icons or patterns too."
      ],
      entries: [
        { id: 22, text: "Please add two-factor authentication. We handle sensitive data and this is a security requirement for us.", themes: ["security and accessibility"], sentiment: "negative", isFeatureRequest: true },
        { id: 26, text: "The color coding for priorities is not accessible for colorblind users. Please use icons or patterns too.", themes: ["security and accessibility"], sentiment: "negative", isFeatureRequest: true },
        { id: 29, text: "Really appreciate the granular privacy controls. This was the main reason we chose your product over alternatives.", themes: ["security and accessibility"], sentiment: "positive", isFeatureRequest: false }
      ]
    },
    {
      name: "missing features",
      count: 4,
      percentage: 13,
      sentiment: { positive: 0, negative: 3, neutral: 1 },
      actionability: "high",
      quotes: [
        "Would love to see a calendar view for tasks. The list view gets overwhelming with 50+ items.",
        "Please add dark mode! I use this app at night and the white screen is blinding."
      ],
      entries: [
        { id: 2, text: "Please add dark mode! I use this app at night and the white screen is blinding.", themes: ["missing features"], sentiment: "negative", isFeatureRequest: true },
        { id: 11, text: "Would love to see a calendar view for tasks. The list view gets overwhelming with 50+ items.", themes: ["missing features"], sentiment: "neutral", isFeatureRequest: true },
        { id: 15, text: "Can you add keyboard shortcuts? I'm a power user and having to click everything is slow.", themes: ["missing integrations", "missing features"], sentiment: "negative", isFeatureRequest: true },
        { id: 16, text: "I accidentally deleted a project and there's no way to recover it. Please add an undo/trash feature.", themes: ["onboarding and permissions", "missing features"], sentiment: "negative", isFeatureRequest: true }
      ]
    }
  ],
  featureRequests: [
    { description: "Slack integration with notifications", count: 1, quotes: ["Why can't I integrate with Slack? Every other tool in our stack has Slack notifications."] },
    { description: "CSV export", count: 1, quotes: ["I've been asking for CSV export for 6 months now. This is a basic feature that every competitor has."] },
    { description: "Google Calendar integration", count: 1, quotes: ["Integration with Google Calendar would be a game changer. Right now I have to manually sync everything."] },
    { description: "Dark mode", count: 1, quotes: ["Please add dark mode! I use this app at night and the white screen is blinding."] },
    { description: "Keyboard shortcuts", count: 1, quotes: ["Can you add keyboard shortcuts? I'm a power user and having to click everything is slow."] },
    { description: "Recurring tasks", count: 1, quotes: ["I wish there was a way to set recurring tasks. I have to manually recreate the same tasks every week."] },
    { description: "Undo / trash feature for deleted projects", count: 1, quotes: ["I accidentally deleted a project and there's no way to recover it. Please add an undo/trash feature."] },
    { description: "Two-factor authentication", count: 1, quotes: ["Please add two-factor authentication. We handle sensitive data and this is a security requirement for us."] },
    { description: "Colorblind-accessible priority indicators", count: 1, quotes: ["The color coding for priorities is not accessible for colorblind users. Please use icons or patterns too."] },
    { description: "Better notification controls", count: 1, quotes: ["The notification system is overwhelming. I get pinged for every tiny change. Need better notification controls."] },
    { description: "Calendar view for tasks", count: 1, quotes: ["Would love to see a calendar view for tasks. The list view gets overwhelming with 50+ items."] }
  ],
  totalEntries: 30,
  analyzedAt: "2026-03-23T00:00:00.000Z"
};
