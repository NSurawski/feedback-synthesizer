# Feedback Synthesizer

An agentic AI tool that ingests raw user feedback, clusters it into themes, scores by frequency and sentiment, extracts feature requests, and generates a prioritized insights report.

## Project Overview

- **Stack:** React 19 + TypeScript (strict) + Tailwind CSS v4 + Vite
- **AI:** Anthropic Claude API via client-side calls (user provides their own API key)
- **Hosting:** GitHub Pages (static build at `/feedback-synthesizer/`)
- **Branch:** `source` is the working branch, `main` is for deployment

## Architecture

### Pipeline (`src/pipeline.ts`)

5-step agentic pipeline, each step is a separate Claude API call:

1. **Ingest & Clean** (Haiku) — parse raw text into individual entries
2. **Classify & Cluster** (Sonnet) — create emergent themes, assign sentiment
3. **Score & Rank** (Sonnet) — rate actionability, sort by composite score
4. **Extract Quotes** (Haiku) — select representative quotes, deduplicate feature requests
5. **Synthesize** (Sonnet) — generate executive summary

Steps 3 and 4 run in parallel via `Promise.all`. Each step has automatic retry (2 attempts, exponential backoff) for transient API errors.

**Model tiering:** `MODEL_FAST` (Haiku) for simple parsing, `MODEL_SMART` (Sonnet) for complex reasoning.

### Components (`src/components/`)

- `ThemeCard.tsx` — theme display with SentimentBar, quotes, expandable entries
- `PipelineProgress.tsx` — step indicator with connecting progress line
- `Report.tsx` — full report: executive summary + themes + feature requests
- `FeatureRequestList.tsx` — shared between partial results and full report

### Key Modules

- `useTheme.ts` — dark mode hook (localStorage + system preference)
- `reportHistory.ts` — saves up to 10 reports in localStorage
- `types.ts` — all TypeScript interfaces
- `sampleData.ts` — 30-entry sample feedback dataset

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Type-check + production build
npm run deploy     # Build + deploy to GitHub Pages
```

## Conventions

- **Dark mode:** All UI elements must have `dark:` Tailwind variants. Class-based dark mode via `@custom-variant` in `index.css`.
- **Components:** Keep `App.tsx` for orchestration and layout only. Extract reusable UI into `src/components/`.
- **Pipeline changes:** If adding a new pipeline step, wrap it with `withRetry()` and emit partial results via `onPartialResult` where applicable.
- **localStorage keys:** Prefix with `feedback-synth-` (e.g., `feedback-synth-key`, `feedback-synth-theme`, `feedback-synth-reports`).
- **No backend:** All API calls go directly to Anthropic from the browser. The API key is stored in localStorage only.
- **TypeScript strict mode** is enabled — no `any` types, no unused variables.
