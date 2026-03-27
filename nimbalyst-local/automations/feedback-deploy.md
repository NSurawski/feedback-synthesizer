---
automationStatus:
  id: feedback-deploy
  title: Deploy Feedback Synthesizer
  enabled: false
  schedule:
    type: daily
    time: "09:00"
  output:
    mode: new-file
    location: nimbalyst-local/automations/feedback-deploy/
    fileNameTemplate: "{{date}}-output.md"
  runCount: 0
---

# Deploy Feedback Synthesizer

Build and deploy the Feedback Synthesizer to GitHub Pages.

## Steps

1. `cd "/Users/nicolesurawski/Documents/PM projects/feedback-synthesizer"`
2. Run `npm run deploy` (this runs `vite build && gh-pages -d dist`)
3. Report the result — success or failure with error details

## Context

- The project deploys to GitHub Pages at `/feedback-synthesizer/`
- `source` branch is for development, `main` is for deployment
- The deploy script builds with Vite then pushes `dist/` to `gh-pages` branch
