---
automationStatus:
  id: feedback-build-check
  title: Build Check Feedback Synthesizer
  enabled: false
  schedule:
    type: daily
    time: "09:00"
  output:
    mode: new-file
    location: nimbalyst-local/automations/feedback-build-check/
    fileNameTemplate: "{{date}}-output.md"
  runCount: 0
---

# Build Check Feedback Synthesizer

Run a type-check and production build validation for the Feedback Synthesizer.

## Steps

1. `cd "/Users/nicolesurawski/Documents/PM projects/feedback-synthesizer"`
2. Run `npm run build` (this runs `tsc -b && vite build`)
3. Report the result:
   - If successful: confirm clean build with no type errors
   - If failed: list all TypeScript errors and build warnings

## Context

- TypeScript strict mode is enabled — no `any` types, no unused variables
- React 19 + TypeScript + Tailwind CSS v4 + Vite
- This is a quick validation step, not a deployment
