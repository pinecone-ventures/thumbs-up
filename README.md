# Thumbs Up - GitHub-Native Doc Feedback

> Zero-infrastructure documentation feedback system using GitHub Issues

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is this?

A lightweight system to collect 👍/👎 feedback on your Markdown documentation, with automatic dashboard aggregation - all using GitHub native features.

**No servers. No databases. No external services.**

Perfect for OSS maintainers, enterprise doc teams, and engineering orgs who want to know which docs are working and which need improvement.

## Features

- 📝 **One-line widget** for any Markdown file
- 📊 **Auto-generated feedback dashboard** showing doc health
- 🔒 **100% GitHub-native** (Issues + Actions)
- 🆓 **Zero infrastructure cost** - runs entirely on GitHub
- ⚡ **< 2 minute installation** - copy, paste, commit
- 🔍 **Transparent** - all feedback visible in Issues
- 🤝 **Anonymous** - no tracking, no cookies, just votes

## Quick Start

### Step 1: Add the GitHub Action

Copy `.github/workflows/update-dashboard.yml` to your repo:

```yaml
name: Update Doc Feedback Dashboard

on:
  issues:
    types: [opened, closed, labeled]
  schedule:
    - cron: '0 0 * * *'  # Nightly at midnight UTC
  workflow_dispatch:

jobs:
  update-dashboard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Update Dashboard
        uses: your-org/thumbs-up-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

[Full workflow example →](docs/INSTALLATION.md#github-action)

### Step 2: Add widgets to your docs

At the bottom of any `.md` file, add:

```markdown
---
**Was this page helpful?**

[👍 Yes](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/README.md+👍&body=**Doc:**+docs/README.md%0A%0A**Vote:**+👍%0A%0A**Additional+comments+%28optional%29:**%0A)
[👎 No](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/README.md+👎&body=**Doc:**+docs/README.md%0A%0A**Vote:**+👎%0A%0A**Additional+comments+%28optional%29:**%0A)
```

Or use the widget generator:

```bash
npm run widget -- docs/your-file.md
```

### Step 3: Enable the workflow

Commit and push. The dashboard will update automatically!

```bash
git add .github/workflows/update-dashboard.yml
git commit -m "Add doc feedback system"
git push
```

## How It Works

```
┌─────────────┐
│   Reader    │
│  clicks 👍  │
└──────┬──────┘
       │
       ├──────────────────────┐
       ▼                      │
┌─────────────────┐           │
│  GitHub Issue   │           │
│  is created     │           │
│                 │           │
│  Labels:        │           │
│  - doc-feedback │           │
│  - thumbs-up    │           │
└────────┬────────┘           │
         │                    │
         │  triggers          │
         ▼                    │
┌─────────────────┐           │
│ GitHub Action   │           │
│ runs on:        │           │
│ - issue events  │           │
│ - nightly       │           │
└────────┬────────┘           │
         │                    │
         │  aggregates        │
         ▼                    │
┌─────────────────┐           │
│  thumbs-up.md   │◄──────────┘
│  Dashboard      │
│                 │
│  Shows:         │
│  - Vote counts  │
│  - Scores       │
│  - Problem docs │
└─────────────────┘
```

**The Flow:**

1. User clicks 👍 or 👎 widget in your Markdown doc
2. GitHub Issue opens with prefilled template
3. User submits issue (optionally adding comments)
4. GitHub Action detects new issue
5. Action aggregates all doc-feedback issues
6. Action updates `thumbs-up.md` dashboard
7. Maintainers see which docs need attention

## Dashboard

The system auto-generates `thumbs-up.md` with:

- 📊 **Vote counts** per document
- 📈 **Satisfaction scores** (% positive)
- 🔥 **Docs needing attention** (low scores or high volume)
- ⭐ **Top-rated docs** (your best documentation)
- 📅 **Recent feedback** (last 7 days)

[Example dashboard →](thumbs-up.md)

### Example Output

```markdown
# Documentation Feedback Dashboard

Last updated: 2025-12-07

## Summary

- **Total feedback**: 47 votes
- **Average satisfaction**: 78%
- **Docs tracked**: 12

## Docs Needing Attention 🔥

| Document | 👍 | 👎 | Score | Issues |
|----------|----|----|-------|--------|
| docs/api/authentication.md | 3 | 8 | 27% | [View](../../issues?q=is:issue+label:doc-feedback+authentication.md) |
| docs/quickstart.md | 5 | 4 | 56% | [View](../../issues?q=is:issue+label:doc-feedback+quickstart.md) |

## Top Rated Docs ⭐

| Document | 👍 | 👎 | Score | Issues |
|----------|----|----|-------|--------|
| docs/examples.md | 12 | 1 | 92% | [View](../../issues?q=is:issue+label:doc-feedback+examples.md) |
| README.md | 8 | 1 | 89% | [View](../../issues?q=is:issue+label:doc-feedback+README.md) |
```

## Installation

See the [detailed installation guide](docs/INSTALLATION.md) for:

- Prerequisites
- Step-by-step setup with screenshots
- Troubleshooting common issues
- Verification steps

## Usage

See the [usage guide](docs/USAGE.md) for:

- Generating widgets for docs
- Interpreting the dashboard
- Handling feedback issues
- Customizing the system
- Bulk-adding feedback to existing docs

## How Feedback is Handled

### Deduplication

The system automatically deduplicates feedback:

- Only the **latest vote** per user per doc is counted
- If a user votes 👎 then later votes 👍, only 👍 is counted
- Based on GitHub username (anonymous users = separate votes)

### Issue Lifecycle

- Issues remain **open** until the doc is improved
- Maintainers **close issues** when they've addressed the feedback
- Closed issues are excluded from the dashboard
- Delete spam issues to remove them entirely

### Customization

You can customize:

- Dashboard format and styling
- Vote thresholds for "needs attention"
- Widget text and emojis
- Issue templates
- Update frequency

[See customization guide →](docs/USAGE.md#customization)

## Local Development

### Testing without GitHub

```bash
# Install dependencies
npm install

# Test core logic
npm run test:unit

# Generate dashboard from fixtures
npm run build:mock

# Generate widget for a doc
npm run widget -- path/to/doc.md
```

### Project Structure

```
thumbs-up/
├── src/
│   ├── core/           # Pure business logic
│   │   ├── aggregator.js    # Vote counting & deduplication
│   │   └── dashboard.js     # Dashboard generation
│   ├── github/         # GitHub API integration
│   │   └── issues.js        # Fetch & parse issues
│   └── cli/            # Command-line tools
│       └── widget.js        # Widget generator
├── .github/
│   └── workflows/
│       └── update-dashboard.yml
├── fixtures/           # Sample data for testing
├── docs/              # Documentation
│   ├── INSTALLATION.md
│   ├── USAGE.md
│   ├── TESTING.md
│   └── FAQ.md
└── thumbs-up.md       # Auto-generated dashboard
```

## Why This Approach?

### GitHub Issues as Backend

- **Native to GitHub** - no new tools to learn
- **Transparent** - anyone can see all feedback
- **Searchable** - use GitHub's issue search
- **Actionable** - maintainers can comment, close, label
- **Free** - no additional cost

### Alternatives Considered

| Approach | Why Not |
|----------|---------|
| External analytics service | Costs money, requires account, privacy concerns |
| GitHub Pages Function | Deprecated, unreliable |
| Custom webhook server | Requires hosting, maintenance |
| Append-only JSON file | Race conditions, merge conflicts |
| Google Forms | External dependency, data not in GitHub |

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development setup
- Testing guidelines
- Code style
- PR process

## FAQ

See [docs/FAQ.md](docs/FAQ.md) for answers to:

- Can users vote multiple times?
- How often does the dashboard update?
- Can I use this with private repos?
- Does this work with GitHub Enterprise?
- How do I remove spam feedback?
- Can I customize the widget text?

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built for maintainers who care about doc quality.

Inspired by the reality that:
- Documentation is hard to keep updated
- Readers rarely provide feedback
- Maintainers need signals about what's broken
- The best tools are simple and GitHub-native

---

**Questions?** [Open an issue](../../issues/new)

**Found this helpful?** Give it a ⭐ on GitHub
