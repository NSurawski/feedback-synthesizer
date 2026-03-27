---
automationStatus:
  id: feedback-pipeline-test
  title: Test Pipeline Changes
  enabled: false
  schedule:
    type: daily
    time: "09:00"
  output:
    mode: new-file
    location: nimbalyst-local/automations/feedback-pipeline-test/
    fileNameTemplate: "{{date}}-output.md"
  runCount: 0
---

# Test Pipeline Changes

Validate pipeline changes for the Feedback Synthesizer by running a build check and starting the dev server.

## Steps

1. `cd "/Users/nicolesurawski/Documents/PM projects/feedback-synthesizer"`
2. Run `npm run build` to check for type errors and build issues
3. If the build succeeds, run `npm run dev` to start the dev server
4. Report:
   - Build result (pass/fail with any errors)
   - Dev server URL if started
   - Remind the user to test the pipeline with sample data (click "Try Sample Data" in the UI)

## Context

- The pipeline is in `src/pipeline.ts` — 5 agentic steps using Anthropic Claude API
- Steps use `withRetry()` for resilience and `onPartialResult` for progressive UI updates
- TypeScript strict mode catches most issues at build time
- The sample dataset has 30 feedback entries for testing
