# Quick Start Guide

Get Thumbs Up running in under 2 minutes.

---

## Prerequisites

- GitHub repository (public or private)
- Admin access to the repository

---

## Installation (2 minutes)

### Step 1: Add the Workflow (30 seconds)

Create `.github/workflows/update-dashboard.yml`:

```yaml
name: Update Doc Feedback Dashboard

on:
  issues:
    types: [opened, closed, labeled, unlabeled]
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

permissions:
  contents: write
  issues: read

jobs:
  update-dashboard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run dashboard
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add thumbs-up.md
          git diff --quiet && git diff --staged --quiet || git commit -m "Update dashboard"
          git push
```

**Copy-paste this file into your repo.**

---

### Step 2: Add a Widget (30 seconds)

At the bottom of any `.md` file, add:

```markdown
---

**Was this page helpful?**

[👍 Yes](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/your-file.md+👍&body=**Doc:**+docs/your-file.md%0A%0A**Vote:**+👍%0A%0A**Additional+comments:**%0A)
[👎 No](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/your-file.md+👎&body=**Doc:**+docs/your-file.md%0A%0A**Vote:**+👎%0A%0A**Additional+comments:**%0A)
```

**Replace `docs/your-file.md` with your actual file path.**

---

### Step 3: Enable Workflow Permissions (30 seconds)

1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Click **Save**

---

### Step 4: Commit and Push (30 seconds)

```bash
git add .github/workflows/update-dashboard.yml
git add docs/  # or whatever files you modified
git commit -m "Add doc feedback system"
git push
```

---

## Verification (30 seconds)

### Test the Workflow

1. Go to **Actions** tab on GitHub
2. Select "Update Doc Feedback Dashboard"
3. Click **Run workflow** → **Run workflow**
4. Wait ~30 seconds
5. Check that `thumbs-up.md` was created

### Test the Widget

1. Navigate to your doc with the widget
2. Click **👍**
3. Submit the issue
4. Wait 1 minute
5. Refresh `thumbs-up.md`
6. Your vote should appear!

---

## You're Done!

The system is now:
- ✅ Collecting feedback via widgets
- ✅ Storing votes in GitHub Issues
- ✅ Updating the dashboard automatically

---

## What's Next?

### Add More Widgets

Run the widget generator:

```bash
npm run widget -- path/to/another-doc.md
```

Copy the output and paste into your doc.

### Check Your Dashboard

View `thumbs-up.md` to see:
- Vote counts per document
- Satisfaction scores
- Docs needing attention
- Top-rated docs

### Respond to Feedback

When you get negative votes:
1. Click "View" link in dashboard
2. Read user comments
3. Fix the doc
4. Close the issue

---

## Common Commands

```bash
# Generate widget for a doc
npm run widget -- docs/api.md

# Manually update dashboard
npm run dashboard

# Export feedback to CSV
npm run export -- --format csv --output feedback.csv

# Verify installation
npm run verify
```

---

## Troubleshooting

### Dashboard not updating?

**Fix:** Check workflow permissions:
- Settings → Actions → General → Workflow permissions
- Must be "Read and write permissions"

### Widget not rendering?

**Fix:** Make sure you're viewing on GitHub, not locally.

### Issues not labeled correctly?

**Fix:** Check the widget URL includes:
```
?labels=doc-feedback,thumbs-up
```

---

## Need Help?

- [Full Installation Guide](INSTALLATION.md)
- [Usage Guide](USAGE.md)
- [FAQ](FAQ.md)
- [Open an issue](../../issues/new)

---

**That's it!** You now have a GitHub-native doc feedback system running in your repo.
