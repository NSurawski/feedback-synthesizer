---
automationStatus:
  id: feedback-dev
  title: Start Feedback Synthesizer Dev Server
  enabled: false
  schedule:
    type: daily
    time: "09:00"
  output:
    mode: new-file
    location: nimbalyst-local/automations/feedback-dev/
    fileNameTemplate: "{{date}}-output.md"
  runCount: 0
---

# Start Feedback Synthesizer Dev Server

Start the Vite development server for the Feedback Synthesizer.

## Steps

1. `cd "/Users/nicolesurawski/Documents/PM projects/feedback-synthesizer"`
2. Run `npm run dev`
3. Report the local URL (typically http://localhost:5173)

## Context

- React 19 + TypeScript + Tailwind CSS v4 + Vite
- The dev server supports hot module replacement
