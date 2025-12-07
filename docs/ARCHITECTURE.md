# Architecture

Technical architecture and design decisions for Thumbs Up.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Documentation                            │
│                      (Markdown files on GitHub)                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  # API Documentation                                      │   │
│  │                                                            │   │
│  │  ...content...                                             │   │
│  │                                                            │   │
│  │  ---                                                       │   │
│  │  **Was this page helpful?**                               │   │
│  │  [👍 Yes](github.com/.../new?labels=...)                 │   │
│  │  [👎 No](github.com/.../new?labels=...)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ User clicks widget
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       GitHub Issue Creation                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Title: Feedback: docs/api.md 👍                          │   │
│  │  Labels: [doc-feedback, thumbs-up]                        │   │
│  │  Body:                                                     │   │
│  │    **Doc:** docs/api.md                                   │   │
│  │    **Vote:** 👍                                           │   │
│  │    **Additional comments:** Great examples!               │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Issue created
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                       │
│                   (.github/workflows/update-dashboard.yml)       │
│                                                                   │
│  Triggers:                                                        │
│  • on: issues (opened, closed, labeled)                          │
│  • on: schedule (nightly)                                        │
│  • on: workflow_dispatch (manual)                                │
│                                                                   │
│  Steps:                                                           │
│  1. Checkout repo                                                │
│  2. Install dependencies                                         │
│  3. Run dashboard generator ───────────┐                         │
│  4. Commit thumbs-up.md                │                         │
└────────────────────────────────────────┼─────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Dashboard Generator                           │
│                      (src/cli/dashboard.js)                      │
│                                                                   │
│  1. Fetch all issues with label: doc-feedback                   │
│  2. Parse issue data (doc path, vote, user, timestamp)          │
│  3. Aggregate votes per document                                │
│  4. Deduplicate (latest vote per user per doc)                  │
│  5. Calculate scores & metrics                                  │
│  6. Generate markdown table                                     │
│  7. Write thumbs-up.md                                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Generated Dashboard                         │
│                        (thumbs-up.md)                            │
│                                                                   │
│  # Documentation Feedback Dashboard                             │
│                                                                   │
│  ## Docs Needing Attention 🔥                                   │
│  | Document | 👍 | 👎 | Score | Issues |                        │
│  |----------|----|----|-------|--------|                        │
│  | api.md   | 3  | 8  | 27%   | [View] |                        │
│                                                                   │
│  ## Top Rated Docs ⭐                                           │
│  | Document | 👍 | 👎 | Score | Issues |                        │
│  |----------|----|----|-------|--------|                        │
│  | readme   | 12 | 1  | 92%   | [View] |                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Layer 1: Core Logic (`src/core/`)

Pure, testable business logic with **no side effects**.

```javascript
// src/core/aggregator.js
function aggregateVotes(issues) {
  // Pure function: issues in, aggregated data out
  // No I/O, no network, no state
}
```

**Components:**

- **aggregator.js**: Counts votes per document
- **deduplicator.js**: Keeps only latest vote per user
- **dashboard.js**: Generates dashboard markdown from data

**Principles:**
- Pure functions
- Easily testable
- No external dependencies
- GitHub-agnostic

---

### Layer 2: GitHub Integration (`src/github/`)

Interfaces with GitHub API.

```javascript
// src/github/issues.js
async function fetchFeedbackIssues({ owner, repo, token }) {
  // Calls GitHub API
  // Returns normalized issue data
}
```

**Components:**

- **issues.js**: Fetch & parse GitHub issues
- **client.js**: Octokit wrapper with auth

**Principles:**
- Uses Octokit
- Handles authentication
- Normalizes data for core layer
- Error handling & retries

---

### Layer 3: CLI Tools (`src/cli/`)

User-facing command-line interface.

```javascript
// src/cli/dashboard.js
async function generateDashboard() {
  const issues = await fetchFeedbackIssues(...);
  const aggregated = aggregateVotes(issues);
  const markdown = renderDashboard(aggregated);
  await fs.writeFile('thumbs-up.md', markdown);
}
```

**Components:**

- **dashboard.js**: Generate dashboard
- **generate-widget.js**: Create widget snippets
- **widget-bulk.js**: Bulk widget operations
- **export.js**: Export data to CSV/JSON

**Principles:**
- Orchestrates core + GitHub layers
- Handles I/O
- User-friendly error messages
- CLI argument parsing

---

## Data Flow

### 1. User Votes

```
User clicks widget
    ↓
GitHub opens issue creation form
    ↓
User submits issue
    ↓
GitHub creates issue with:
  - labels: [doc-feedback, thumbs-up/down]
  - body: Doc path + vote + comments
```

### 2. GitHub Action Triggers

```
Issue created/updated
    ↓
Workflow triggered
    ↓
Action checks out repo
    ↓
Action runs dashboard generator
```

### 3. Dashboard Generation

```
Fetch issues via GitHub API
    ↓
Filter: label = doc-feedback, state = open
    ↓
Parse each issue:
  - Extract doc path from body
  - Extract vote from labels
  - Get user, timestamp
    ↓
Aggregate votes per document
    ↓
Deduplicate by user+doc (keep latest)
    ↓
Calculate scores: 👍 / (👍 + 👎)
    ↓
Sort by score, volume, recency
    ↓
Generate markdown tables
    ↓
Write thumbs-up.md
    ↓
Commit and push
```

---

## Data Model

### GitHub Issue

```json
{
  "number": 142,
  "title": "Feedback: docs/api.md 👎",
  "body": "**Doc:** docs/api.md\n\n**Vote:** 👎\n\n**Comments:** Examples are outdated",
  "labels": [
    { "name": "doc-feedback" },
    { "name": "thumbs-down" }
  ],
  "user": {
    "login": "alice"
  },
  "created_at": "2025-12-07T10:00:00Z",
  "state": "open"
}
```

### Parsed Vote

```javascript
{
  doc: "docs/api.md",
  vote: "down", // or "up"
  user: "alice",
  timestamp: "2025-12-07T10:00:00Z",
  comments: "Examples are outdated"
}
```

### Aggregated Data

```javascript
{
  "docs/api.md": {
    up: 3,
    down: 8,
    total: 11,
    score: 0.27,
    recentCount: 3,
    issues: [...]
  }
}
```

### Dashboard Output

```markdown
| Document | 👍 | 👎 | Score | Total | Issues |
|----------|----|----|-------|-------|--------|
| docs/api.md | 3 | 8 | 27% | 11 | [View](...) |
```

---

## Key Algorithms

### Vote Deduplication

**Problem:** Users can vote multiple times. Only count the latest.

**Algorithm:**

```javascript
function deduplicateVotes(votes) {
  const latest = {};

  // Group by user + doc
  for (const vote of votes.sort(byTimestamp)) {
    const key = `${vote.user}:${vote.doc}`;
    latest[key] = vote; // Overwrites earlier votes
  }

  return Object.values(latest);
}
```

**Example:**

```
Input:
  alice votes 👎 on api.md (Monday)
  alice votes 👍 on api.md (Tuesday)

Output:
  Only Tuesday's 👍 vote is counted
```

### Score Calculation

```javascript
function calculateScore(up, down) {
  const total = up + down;
  if (total === 0) return null; // No votes yet
  return up / total;
}
```

**Edge cases:**
- Zero votes: `null` or "N/A"
- Only positive: `100%`
- Only negative: `0%`

### Dashboard Sorting

**Priority 1:** Docs needing attention
- `score < 0.60` OR `down > 3`
- Sorted by score (lowest first)

**Priority 2:** Top rated
- `score >= 0.85` AND `total >= 3`
- Sorted by score (highest first)

**Priority 3:** All others
- Sorted by total vote count (highest first)

---

## GitHub Actions Workflow

### Trigger Events

```yaml
on:
  issues:
    types: [opened, closed, labeled, unlabeled]
  schedule:
    - cron: '0 0 * * *'  # Nightly
  workflow_dispatch:      # Manual
```

**Why these triggers?**
- `issues`: Real-time updates when feedback arrives
- `schedule`: Backup in case issue trigger fails
- `workflow_dispatch`: Manual refresh for testing

### Permissions

```yaml
permissions:
  contents: write  # To commit dashboard
  issues: read     # To fetch issues
```

**Minimal permissions** following least-privilege principle.

### Job Steps

1. **Checkout** - Get latest code
2. **Setup Node** - Install Node.js 20
3. **Install deps** - `npm ci` (faster than `npm install`)
4. **Generate** - Run dashboard script
5. **Commit** - Only if changes detected
6. **Comment** - Notify user (optional)

---

## Security Considerations

### GitHub Token

- Uses `GITHUB_TOKEN` secret (auto-created by GitHub)
- Scoped to the repository
- Expires after workflow completes
- Never exposed in logs

### Input Validation

All user input (from issue bodies) is validated:

```javascript
function parseDocPath(body) {
  const match = body.match(/\*\*Doc:\*\*\s+(.+)/);
  if (!match) return null;

  const path = match[1].trim();

  // Validate: no path traversal
  if (path.includes('..')) return null;

  // Validate: markdown files only
  if (!path.endsWith('.md')) return null;

  return path;
}
```

**Prevents:**
- Path traversal attacks (`../etc/passwd`)
- Non-markdown files
- Malformed input

### Rate Limiting

GitHub API limits:
- **Authenticated**: 5,000 requests/hour
- **Actions**: Higher limits

Dashboard generation typically uses:
- 1 request to list issues
- ~5-10 requests total

**Well within limits** even with frequent updates.

---

## Performance

### Optimization Strategies

1. **Incremental updates:**
   - Only process changed issues
   - Cache previous results

2. **Pagination:**
   - Fetch issues in batches of 100
   - Stop early if all recent issues processed

3. **Parallel processing:**
   - Process multiple docs concurrently

### Current Performance

**Typical dashboard generation:**
- 50 issues: ~2 seconds
- 500 issues: ~5 seconds
- 5,000 issues: ~30 seconds

**Bottlenecks:**
- GitHub API latency (~200ms per request)
- Markdown rendering (negligible)
- File I/O (negligible)

---

## Scalability

### Current Limits

- **Issues per repo**: GitHub allows millions
- **Workflow runs**: 20 concurrent per repo
- **API rate**: 5,000 requests/hour

### Scaling Strategies

If you reach limits:

1. **Reduce trigger frequency:**
   ```yaml
   schedule:
     - cron: '0 0 * * 1'  # Weekly instead of nightly
   ```

2. **Archive old issues:**
   - Close issues older than 6 months
   - Export to CSV for historical analysis

3. **Conditional triggers:**
   ```yaml
   on:
     issues:
       types: [opened, closed]
       # Only on doc-feedback issues
   ```

---

## Testing Architecture

### Test Pyramid

```
        ┌─────────────┐
        │     E2E     │  ← Few, slow, full workflow
        │   (1-2)     │
        ├─────────────┤
        │ Integration │  ← Some, medium, GitHub API
        │   (5-10)    │
        ├─────────────┤
        │    Unit     │  ← Many, fast, pure logic
        │  (50-100)   │
        └─────────────┘
```

**Unit tests:**
- Test `src/core/` functions
- Use fixtures, no I/O
- Fast (<1ms per test)

**Integration tests:**
- Test `src/github/` API calls
- Use real GitHub API with test repo
- Medium speed (~100ms per test)

**E2E tests:**
- Full workflow: vote → dashboard
- Rare, only for critical paths
- Slow (~5s per test)

### Test Fixtures

```
tests/fixtures/
├── issues/
│   ├── sample-vote-up.json
│   ├── sample-vote-down.json
│   └── sample-with-comments.json
└── expected/
    └── sample-dashboard.md
```

**Benefits:**
- Consistent test data
- No network dependency
- Fast test execution

---

## Future Architecture

### Planned Enhancements

1. **Incremental updates:**
   - Only fetch issues since last run
   - Cache previous aggregations
   - Faster for large repos

2. **Multi-signal feedback:**
   - Beyond 👍/👎: "confusing", "outdated", etc.
   - Richer dashboard insights

3. **AI-powered insights:**
   - Summarize comment themes
   - Auto-suggest doc improvements
   - Generate PRs for fixes

4. **Badge generation:**
   - Shields.io-style badges
   - Show doc quality in README

---

## Design Decisions

### Why GitHub Issues?

**Considered alternatives:**
- JSON file in repo → Merge conflicts
- GitHub Discussions → No labels, hard to query
- External service → Costs money, privacy concerns

**GitHub Issues wins:**
- Native to GitHub
- Searchable & filterable
- Transparent
- Free

### Why GitHub Actions?

**Considered alternatives:**
- Webhook server → Requires hosting
- Cron job → Needs infrastructure
- Local script → Manual, not automatic

**GitHub Actions wins:**
- Free (2,000 mins/month)
- Integrated with repo
- Triggered automatically
- No maintenance

### Why Markdown Dashboard?

**Considered alternatives:**
- HTML page → Needs hosting
- GitHub Pages site → Complex setup
- External analytics → Not GitHub-native

**Markdown wins:**
- Renders beautifully on GitHub
- Version controlled
- No build step
- Zero hosting

---

## References

- [GitHub Issues API](https://docs.github.com/en/rest/issues)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Octokit.js](https://github.com/octokit/octokit.js)

---

**Questions about architecture?** [Open an issue](../../issues/new)
