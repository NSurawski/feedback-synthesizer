---
automationStatus:
  id: feedback-sync
  title: Sync & Deploy Feedback Synthesizer
  enabled: false
  schedule:
    type: daily
    time: "09:00"
  output:
    mode: new-file
    location: nimbalyst-local/automations/feedback-sync/
    fileNameTemplate: "{{date}}-output.md"
  runCount: 0
---

# Sync & Deploy Feedback Synthesizer

Pull latest changes, build, and deploy the Feedback Synthesizer to GitHub Pages.

## Steps

1. `cd "/Users/nicolesurawski/Documents/PM projects/feedback-synthesizer"`
2. Run `git pull --rebase origin source` to get latest changes
3. Run `npm run build` to validate the build
4. If build passes, run `npm run deploy` to publish to GitHub Pages
5. Report each step's result

## Context

- `source` is the working branch, `main` is for deployment
- Deploy pushes the built `dist/` folder to the `gh-pages` branch
- The site is hosted at https://nsurawski.github.io/feedback-synthesizer/
- If the pull has conflicts, stop and report them instead of continuing
