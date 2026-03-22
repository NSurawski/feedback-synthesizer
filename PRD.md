# PRD: User Feedback Synthesizer

## TL;DR

PMs drown in unstructured user feedback — support tickets, app reviews, survey responses, interview transcripts — and spend hours manually reading, categorizing, and synthesizing it. The User Feedback Synthesizer is an agentic AI tool that ingests raw feedback, autonomously clusters it into themes, scores each theme by frequency and sentiment, extracts actionable feature requests with supporting quotes, and outputs a prioritized insights report ready for roadmap planning.

## Problem Statement

Product managers collect feedback from dozens of sources — support tickets, NPS surveys, user interviews, app store reviews, sales call notes — but synthesizing it is a manual, time-consuming process. This creates several problems:

1. **Synthesis bottleneck** — Reading and tagging hundreds of feedback entries takes hours, delaying insight delivery to the team
2. **Recency bias** — PMs over-index on the last few pieces of feedback they read rather than seeing the full picture
3. **Inconsistent taxonomy** — Different PMs categorize the same feedback differently, making cross-team aggregation unreliable
4. **Lost signal** — Subtle patterns (e.g., 15 users mentioning the same friction point in slightly different words) get missed when processing manually
5. **Quote hunting** — When presenting insights to stakeholders, PMs spend additional time finding the best supporting quotes for each theme

### The Insight

Feedback synthesis is a pattern recognition task — exactly the kind of work where AI agents excel. An agent can read every entry, maintain a consistent taxonomy, detect patterns across hundreds of data points, and surface the most representative quotes — all in seconds instead of hours.

## Target Users

| User Segment | Pain Point | Primary Benefit |
|---|---|---|
| **Product Managers** | Spend 4-8 hours per sprint manually reading and tagging feedback | Get a prioritized insights report in minutes, not hours |
| **UX Researchers** | Need to synthesize interview transcripts into themes quickly | Automated affinity mapping with supporting evidence |
| **Customer Success Leads** | Know what customers are saying but struggle to communicate patterns to product | Shareable, data-backed reports that quantify customer pain |
| **Founders / Solo PMs** | No dedicated research team; feedback sits unprocessed in spreadsheets | Lightweight synthesis without needing a research org |

## User Stories

1. **As a PM with 200 support tickets**, I want to paste them in and get a clustered theme report so I can identify the top 5 issues without reading every ticket.
2. **As a PM preparing for roadmap planning**, I want to see feature requests ranked by frequency and sentiment so I can make data-backed prioritization arguments.
3. **As a PM presenting to leadership**, I want supporting quotes auto-linked to each theme so I can tell a compelling story without manually searching for examples.
4. **As a researcher analyzing interview transcripts**, I want the tool to identify themes across participants so I can build an affinity map faster.
5. **As a PM**, I want to see sentiment distribution per theme (positive/negative/neutral) so I can distinguish "users want X" from "users are frustrated by Y."
6. **As a PM**, I want to drill down into any theme and see all the raw feedback entries that belong to it so I can verify the clustering is accurate.
7. **As a PM**, I want to export the insights report as a shareable format so I can attach it to a product brief or Slack it to the team.

## Core Workflow (Agentic Pipeline)

The tool uses a multi-step agentic AI pipeline — the AI doesn't just summarize, it autonomously executes a structured analysis workflow:

### Step 1: Ingest & Clean
- User pastes raw feedback (free-text, CSV, or bullet points)
- Agent normalizes the input: strips duplicates, identifies individual entries, flags ambiguous items

### Step 2: Classify & Cluster
- Agent reads every entry and autonomously creates theme categories
- Each entry gets tagged with one or more themes
- Agent merges near-duplicate themes (e.g., "slow loading" and "performance issues" → single cluster)

### Step 3: Score & Rank
- Each theme is scored by:
  - **Frequency** — how many entries mention this theme
  - **Sentiment intensity** — average sentiment strength (strong negative vs. mild frustration)
  - **Actionability** — whether the feedback implies a concrete product change
- Themes are ranked by a composite score

### Step 4: Extract & Attribute
- For each theme, the agent selects the 2-3 most representative quotes from the raw feedback
- Feature requests are extracted as standalone items with frequency counts

### Step 5: Synthesize & Report
- Agent generates a structured insights report:
  - Executive summary (top 3 takeaways)
  - Theme breakdown with frequency, sentiment, and quotes
  - Feature request leaderboard
  - Recommended next steps

## Functional Requirements

### P0 — Must Have (MVP)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-01 | Paste raw feedback input | Text area accepts free-text feedback; handles 1-500 entries; shows entry count after paste |
| FR-02 | Agentic analysis pipeline | Clicking "Analyze" triggers the multi-step pipeline with visible progress (step indicators) |
| FR-03 | Theme clustering | Agent groups feedback into 3-12 themes with auto-generated labels; no pre-defined taxonomy required |
| FR-04 | Theme frequency scoring | Each theme shows entry count and percentage of total feedback |
| FR-05 | Sentiment analysis per theme | Each theme shows sentiment breakdown (positive/negative/neutral) with color-coded indicators |
| FR-06 | Representative quotes | Each theme displays 2-3 auto-selected quotes from the original feedback |
| FR-07 | Feature request extraction | Standalone section listing feature requests with frequency count, separate from general themes |
| FR-08 | Executive summary | Auto-generated 3-5 bullet executive summary at the top of the report |
| FR-09 | Theme drill-down | Clicking a theme expands to show all raw entries classified under it |
| FR-10 | Pipeline progress visibility | Users see which step the agent is on (Ingesting → Clustering → Scoring → Extracting → Synthesizing) |
| FR-11 | Sample data | "Try with sample data" button loads pre-built feedback dataset so users can see the tool in action immediately |

### P1 — Should Have (v2)

- Export report as PDF or Markdown
- Compare two feedback sets (e.g., before/after a feature launch)
- Custom theme labels — user can rename or merge agent-generated themes
- Feedback source tagging (support, reviews, surveys) with per-source filtering
- Saved reports with history

### P2 — Nice to Have (Future)

- CSV/JSON file upload (not just paste)
- Integration with support tools (Zendesk, Intercom) for direct import
- Trend analysis across multiple time periods
- Slack bot that posts weekly feedback digests
- Team workspace with shared reports

## Key UX Design Decisions

| Decision | Rationale | Alternative Considered |
|---|---|---|
| Paste-first input (not file upload) for MVP | Lowest friction for initial use; works with any source; no file format parsing needed | File upload — deferred to v2 to keep MVP simple |
| Visible pipeline steps during analysis | Makes the agentic behavior transparent; users see the AI "working" rather than waiting for a black box | Single loading spinner — rejected because it hides the multi-step intelligence |
| Agent-generated taxonomy (not predefined categories) | Every product's feedback is different; predefined categories would miss domain-specific themes | Predefined category list — rejected as too rigid |
| Sentiment shown as distribution, not single score | A theme can have mixed sentiment (some positive, some negative); a single score hides this nuance | Single sentiment label per theme — rejected as oversimplified |
| Quotes auto-selected, not user-picked | Reduces manual effort; agent picks quotes that are most representative of the cluster | User manually selects quotes — rejected as too slow |

## Technical Architecture (MVP)

- **Frontend:** React 19 + TypeScript + Tailwind CSS (Vite build)
- **AI Backend:** Claude API (Anthropic) via client-side calls with user-provided API key
- **Agentic Pipeline:** Sequential Claude API calls with structured JSON output at each step
- **State Management:** React useState + useReducer for pipeline state machine
- **Persistence:** localStorage for saved reports and API key
- **Hosting:** GitHub Pages (static build)

### Why Client-Side AI Calls?

For an MVP / portfolio project, calling the Claude API directly from the client (with the user's own API key) eliminates the need for a backend server. This keeps deployment simple (static hosting) while demonstrating the full agentic pipeline. A production version would route through a backend proxy for key security.

### Pipeline Architecture

```
User Input (raw text)
    ↓
[Step 1] Ingest & Clean → normalized entries[]
    ↓
[Step 2] Classify & Cluster → themes[] with entry assignments
    ↓
[Step 3] Score & Rank → scored themes[] with sentiment
    ↓
[Step 4] Extract & Attribute → quotes[] + feature requests[]
    ↓
[Step 5] Synthesize → executive summary + full report
```

Each step is a separate Claude API call with:
- Structured JSON output (using tool_use or JSON mode)
- The previous step's output as context
- Step-specific system prompts optimized for that task

## Non-Functional Requirements

- **Performance:** Analysis of 100 feedback entries should complete in < 30 seconds
- **Data privacy:** No feedback data is stored server-side; all processing uses the user's own API key; data stays in their browser
- **Accessibility:** Keyboard-navigable; screen reader-friendly report output; sufficient color contrast
- **Responsive:** Usable on tablet and desktop viewports (mobile is secondary for this workflow)
- **Error handling:** Graceful degradation if any pipeline step fails; ability to retry individual steps

## Assumptions & Risks

### Assumptions

- Users have access to a Claude API key (or the app provides a demo mode with sample data)
- 100-500 entries is a typical batch size for synthesis; the tool doesn't need to handle 10K+ entries
- Users want speed over perfect accuracy — a good-enough synthesis in 30 seconds beats a perfect one in 3 hours
- Theme clustering doesn't need to match a predefined taxonomy; emergent categories are more useful

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Clustering inconsistency — same feedback analyzed twice produces different themes | Medium | Medium | Use temperature=0 and structured prompts; allow users to rename/merge themes |
| API cost concerns — multi-step pipeline uses 4-5 API calls per analysis | Medium | Low | Show estimated token usage before analysis; optimize prompts to minimize tokens |
| Users don't trust AI-generated categories | Medium | High | Drill-down view lets users verify every entry's classification; transparent pipeline builds trust |
| Large input causes API timeout or token limit | Low | High | Chunk large inputs and process in batches; show progress per batch |
| Sentiment analysis accuracy on short entries | Medium | Low | Show confidence scores; let users override sentiment on individual entries |

## Success Metrics

| Metric | Target | Rationale |
|---|---|---|
| Analysis completion rate (user pastes feedback → views full report) | ≥ 80% | Users who start an analysis should see it through; drop-off indicates friction |
| Theme accuracy (user doesn't need to rename/merge more than 20% of themes) | ≥ 80% | The AI-generated taxonomy should be useful out of the box |
| Time to insight (paste → reading executive summary) | < 60 sec for 100 entries | Must be dramatically faster than manual synthesis to justify the tool |
| Quote relevance (user finds auto-selected quotes useful) | ≥ 70% | If quotes aren't representative, the report loses credibility |
| Return usage (user runs 3+ analyses) | ≥ 40% | Indicates the tool earns a place in the PM's recurring workflow |

## Out of Scope (MVP)

- User accounts or authentication
- Backend server — all processing happens client-side with user's API key
- Real-time collaboration or shared reports
- Integration with external tools (Zendesk, Intercom, Jira)
- Historical trend analysis across multiple feedback batches
- Custom AI model fine-tuning

## Open Questions

1. Should the tool support multiple input formats in MVP (CSV columns, JSON arrays) or just free-text paste?
2. Is there value in letting users define "focus areas" before analysis (e.g., "I care most about onboarding feedback") to guide the clustering?
3. Should theme labels be noun phrases ("onboarding confusion") or problem statements ("users struggle to complete onboarding")?
4. Would a comparison mode (before/after a feature launch) be a P1 or P2 feature?
5. Should the tool recommend which themes map to which product areas, or is that too opinionated for a general-purpose tool?

---

*PRD by Nicole Surawski · March 2026*
