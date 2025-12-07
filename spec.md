# 📄 Doc Feedback MVP — Product Specification  
**Version:** 0.1  
**Status:** Draft  
**Owner:** Greg  

---

## 1. Overview

Developer documentation rots. Code evolves, docs get stale, and there is no lightweight signal from readers to maintainers.  
The goal of this project is to provide a **zero-friction feedback loop inside Markdown docs**, with a dashboard inside GitHub itself.

The project delivers:

- A **thumbs up / thumbs down widget** embedded at the bottom of any `.md` file.  
- Clicking the widget **logs an event** into a GitHub-native storage mechanism (no external infra).  
- A GitHub Actions workflow aggregates feedback and updates a **Dashboard.md** automatically.  
- Installation consists of:
  1. Adding a GitHub Action workflow file.  
  2. Adding a one-line snippet to any Markdown doc.  

This must be **lightweight, dependency-minimal, GitHub-native**, and robust enough for enterprise doc teams, OSS maintainers, and internal engineering orgs.

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Provide a **non-invasive** way to collect per-document feedback.
- Require **no external servers**, paid infra, or external databases.
- Use **GitHub-native primitives** (Actions + Pages + Repo files).
- Support **anonymous simple sentiment** (👍 / 👎).
- Make installation **extremely easy**.
- Produce a **central dashboard** summarizing:
  - total votes  
  - positive/negative ratio  
  - most problematic docs  
  - most loved docs  

### 2.2 Non-Goals (MVP)
- Rich multi-signal feedback.
- Inline section-level or paragraph-level ratings.
- Free-text comments.
- Private analytics backends.
- Real-time updates (dashboard can update nightly or on push).

---

## 3. User Personas

### Code Owners / Maintainers
- Want to know which docs are stale, confusing, or misleading.  
- Want frictionless visibility into doc health.  
- Don’t want to manage servers.

### Engineers / Contributors
- Want to quickly react when a doc is wrong.  
- Want feedback to be anonymous and painless.

### Open Source Maintainers
- Need a solution requiring zero infra setup.  
- Value transparency and GitHub-native workflows.

---

## 4. User Experience

### Markdown UI
At the bottom of any `.md` file:

```
<!-- FEEDBACK -->
![👍](https://<your-gh-pages-url>/feedback?doc=path/to/file&vote=up)
![👎](https://<your-gh-pages-url>/feedback?doc=path/to/file&vote=down)
```

When rendered on GitHub, these appear as clickable icons/badges.

**Click behavior:**
- Sends a request to a GitHub Pages Function endpoint.  
- Logs an event (doc, vote, timestamp) into a JSON file in the repo.  
- Redirects to a thank-you page or back to the doc.

---

## 5. Architecture

### 5.1 Components

#### 1. Markdown Widget  
- Two image links acting as buttons.  
- URL parameters encode document path + vote type.

#### 2. GitHub Pages Function  
Triggered by clicking a badge. Responsible for:
- Parsing `doc` and `vote` from query params  
- Appending a record to `feedback/log.json` inside the repo  
- Returning a simple thank-you HTML response  

#### 3. Feedback Store  
File: `feedback/log.json`  
Append-only JSON lines file.

Example entry:
```json
{
  "doc": "docs/api.md",
  "vote": "down",
  "timestamp": "2025-01-01T12:34:56Z"
}
```

#### 4. Dashboard Generator (GitHub Action)
- Runs nightly or on push  
- Reads `log.json`, aggregates stats  
- Writes/updates `docs/Dashboard.md`  

### 5.2 No External Infra
The entire system runs on GitHub:
- GitHub Actions  
- GitHub Pages Functions  
- GitHub API  
- Repo-stored JSON  

No servers. No payments. Minimal friction.

---

## 6. Installation

### Step 1: Add GitHub Action
Add `.github/workflows/doc-feedback.yml` to:
- Aggregate logs  
- Generate dashboard

### Step 2: Enable GitHub Pages Functions
Turn on in repo settings.

### Step 3: Add Markdown Snippet
Place at bottom of each doc:

```
<!-- FEEDBACK -->
[👍](https://<your-gh-pages-url>/feedback?doc=./THIS_FILE&vote=up)
[👎](https://<your-gh-pages-url>/feedback?doc=./THIS_FILE&vote=down)
```

---

## 7. Data Model

### Event Schema

| Field      | Type                    | Description |
|-----------|--------------------------|-------------|
| `doc`      | string                  | Path of doc being rated |
| `vote`     | enum(`up`,`down`)       | Sentiment |
| `timestamp`| ISO-8601 string         | Server-generated timestamp |
| `user`     | string \| null          | Optional GitHub username (MVP = null) |

### Aggregations

- Total 👍 and 👎 per document  
- Score = 👍 / (👍 + 👎)  
- Trending negatively rated docs  
- Total vote volume  

---

## 8. Agentic Build Requirements

### Modules

1. `widget/`
   - Markdown-safe generator for the thumbs widget.

2. `function/`
   - GitHub Pages Function to log events.

3. `dashboard/`
   - GitHub Action to rebuild dashboard markdown.

4. `installer/` (future)
   - CLI script to auto-insert widgets into docs.

### Acceptance Criteria

- Clicking 👍 or 👎 from a GitHub-rendered Markdown file logs a valid event.
- Dashboard updates correctly and deterministically via Action.
- `log.json` remains valid append-only JSON.
- Install flow is < 2 minutes.

---

## 9. Security & Privacy

- Anonymous by default.  
- No cookies, no identifiers.  
- Minimal data stored: `doc`, `vote`, `timestamp`.  
- Requests only interact with GitHub API via Pages Function token.

---

## 10. Future Enhancements

- Multi-signal reactions (“confusing”, “outdated”, “needs examples”).  
- Inline doc annotation.  
- AI agent automatically summarizing feedback.  
- AI proposing PR additions or improvements.  
- Coverage mapping and doc-level quality scoring.

---

## 11. Open Questions

1. Should referrer URL be captured?  
2. Should users be allowed to vote multiple times?  
3. Should votes create PRs instead of writing to main?  
4. Should redirect go back to the doc or to a thank-you page?  
5. Should repo-level quality badges be included?

---

## 12. Decision Log

| Decision | Reason |
|---------|--------|
| GitHub-only infra | Avoid paid servers & maximize adoption |
| Anonymous feedback | Simplifies UX and privacy |
| Per-doc feedback | Granular and actionable |
| Use GitHub Pages Functions | Lightweight, no infra |
| Use log.json in repo | Transparent, auditable, simple |

# 📄 Doc Feedback MVP — Product Specification  
**Version:** 0.2  
**Status:** Draft  
**Owner:** Greg  

---

## 1. Overview

Developer documentation decays over time. Code changes, docs fall behind, and there is rarely a lightweight signal from readers to maintainers.  
The goal of this project is to provide a **zero-friction feedback loop inside Markdown docs**, with a fully GitHub-native dashboard and no external infrastructure.

The MVP provides:

- A **thumbs up / thumbs down widget** embedded at the bottom of any `.md` file  
- Clicking the widget opens a **prefilled GitHub Issue** to record feedback  
- A **GitHub Action** aggregates all feedback issues into a single `Dashboard.md`  
- Installation requires:
  1. Adding a workflow file  
  2. Adding a one-line widget snippet to Markdown docs  

This solution is **GitHub-only**, **infra‑free**, **anonymous**, and easy for maintainers to adopt.

---

## 2. Goals & Non‑Goals

### 2.1 Goals
- Provide a low‑effort, low‑friction way to collect per‑document feedback  
- Avoid all external servers, databases, or paid services  
- Store all feedback natively in GitHub (Issues)  
- Use GitHub Actions to build a feedback dashboard  
- Support simple anonymous sentiment: 👍 / 👎  
- Make installation extremely simple (copy‑paste + workflow)  

### 2.2 Non‑Goals (MVP)
- Multi-signal reactions  
- Inline or paragraph-level feedback  
- Custom HTML or JavaScript widgets  
- Real-time dashboards  
- External analytics or BI tools  

---

## 3. User Personas

### Code Owners / Maintainers
- Want fast signals when docs are wrong or outdated  
- Prefer no external dependencies  
- Want aggregated visibility across the repo  

### Engineers / Contributors
- Want anonymous, frictionless doc feedback  
- Should not need to authenticate outside GitHub  

### Open Source Maintainers
- Need a solution installable without infra  
- Want transparency and GitHub-native storage  

---

## 4. User Experience

### Markdown Widget (MVP)
At the bottom of any `.md` file:

```
<!-- FEEDBACK -->
[👍 This doc was helpful](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+README.md+👍&body=Doc:+README.md)
[👎 This doc needs work](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+README.md+👎&body=Doc:+README.md)
```

These links:

- Render cleanly in GitHub Markdown  
- Do not require JS or custom HTML  
- When clicked, open a **prefilled GitHub Issue** containing:  
  - sentiment  
  - doc path  
  - optional comments  

Users submit the issue and are done.  
Each issue becomes a logged “event.”

---

## 5. Architecture

### 5.1 Components

#### 1. Markdown Widget
- Implemented as plain Markdown links  
- Uses GitHub Issue creation URLs with prefilled metadata  
- Two variants: 👍 and 👎  

#### 2. Feedback Store — **GitHub Issues**
- Every new doc-feedback issue = one feedback event  
- Labeled with:
  - `doc-feedback`  
  - `thumbs-up` OR `thumbs-down`  
- Issue body stores doc path & optional user comments  
- GitHub timestamps provide event time  

##### Example Issue Body
```
Doc: docs/api.md
Sentiment: 👍
Notes: (optional)
```

#### 3. Dashboard Generator — **GitHub Action**
Runs nightly or on push:

- Queries GitHub Issues with `label=doc-feedback`  
- Parses doc path, sentiment, and timestamps  
- Aggregates counts per doc  
- Generates/updates `docs/Dashboard.md`  

This produces a human-readable table of documentation health.

### 5.2 No External Infra
The system uses:

- GitHub Issues
- GitHub Actions
- Markdown only

No servers. No databases. No cost.

---

## 6. Installation

### Step 1: Add GitHub Action
Add `.github/workflows/doc-feedback.yml` which:

- Reads all `doc-feedback` issues  
- Aggregates votes  
- Writes `docs/Dashboard.md`

### Step 2: Add Markdown Snippet
Place at the bottom of any `.md` doc:

```
<!-- FEEDBACK -->
[👍 This doc was helpful](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+THIS_FILE+👍&body=Doc:+THIS_FILE)
[👎 This doc needs work](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+THIS_FILE+👎&body=Doc:+THIS_FILE)
```

### Optional Step 3: Add Issue Template
File: `.github/ISSUE_TEMPLATE/doc-feedback.yml`

This enables optional comments or structured metadata.

---

## 7. Data Model

### Event Schema (Issue-Based)

| Field        | Source                  | Description |
|--------------|--------------------------|-------------|
| `doc`        | URL param / issue body   | Path of the document |
| `vote`       | labels (`thumbs-up`/`thumbs-down`) | Sentiment |
| `timestamp`  | GitHub issue `created_at` | When the vote was submitted |
| `notes`      | optional issue body       | Additional context if user added comments |

### Aggregations

- total 👍 and 👎 per doc  
- score = 👍 / (👍 + 👎)  
- trending problem docs  
- total issue volume  

---

## 8. Agentic Build Requirements

### Modules

1. `widget/`  
   - Generates cleaned widget snippet for Markdown  

2. `dashboard/`  
   - GitHub Action parsing issues → dashboard  

3. `templates/` (optional)  
   - Issue template for structured feedback  

### Acceptance Criteria

- Clicking a widget link results in a correctly labeled GitHub issue  
- Dashboard Action runs successfully and idempotently  
- `Dashboard.md` updates deterministically  
- Install flow < 2 minutes  

---

## 9. Security & Privacy

- Anonymous by default  
- GitHub Issues track no user identity beyond GitHub’s native metadata  
- No IP logging or external data collection  
- Repo maintainers fully control the feedback data  

---

## 10. Future Enhancements

- Multi-signal reaction bar (e.g., “confusing”, “outdated”, “needs examples”)  
- Inline doc annotations via comments  
- AI agent automatically summarizing issue trends  
- AI-generated doc improvements & proposed PRs  
- Quality scoring and coverage metrics  

---

## 11. Open Questions

1. Auto-detect doc path instead of manually inserting it?  
2. Allow multiple votes per user?  
3. Should votes open PRs instead of issues?  
4. Should dashboard include repo-level “Doc Quality Score” badge?  
5. Should the widget be auto-inserted by a CLI?  

---

## 12. Decision Log

| Decision | Reason |
|---------|--------|
| Use GitHub Issues as backend | Most stable GitHub-native logging mechanism |
| Avoid external infra | Zero cost, zero setup burden |
| Use Markdown-only widget | Works everywhere GitHub renders Markdown |
| Use GitHub Actions for dashboard | Free, automated aggregation |
| Per-doc granularity | Actionable feedback for maintainers |