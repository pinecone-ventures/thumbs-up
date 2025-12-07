# Installation Guide

Complete step-by-step guide to installing Thumbs Up in your repository.

**Expected time:** < 2 minutes

---

## Prerequisites

Before you begin, ensure you have:

- ✅ A GitHub repository (public or private)
- ✅ Admin access to the repository
- ✅ GitHub Actions enabled (enabled by default)
- ✅ Git installed locally (for adding files)

---

## Installation Steps

### Step 1: Add the GitHub Action Workflow

Create the workflow file that will aggregate feedback and update your dashboard.

#### 1.1 Create the workflow directory

```bash
mkdir -p .github/workflows
```

#### 1.2 Create the workflow file

Create `.github/workflows/update-dashboard.yml`:

```yaml
name: Update Doc Feedback Dashboard

on:
  issues:
    types: [opened, closed, labeled, unlabeled]
  schedule:
    # Run nightly at midnight UTC
    - cron: '0 0 * * *'
  workflow_dispatch:  # Allow manual triggering

permissions:
  contents: write
  issues: read

jobs:
  update-dashboard:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Generate dashboard
        run: npm run dashboard
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit dashboard updates
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add thumbs-up.md
          git diff --quiet && git diff --staged --quiet || \
            git commit -m "Update doc feedback dashboard [automated]"
          git push
```

**What this does:**

- **Triggers on:** New feedback issues, nightly schedule, manual runs
- **Permissions:** Read issues, write dashboard file
- **Actions:** Fetches issues, aggregates votes, updates `thumbs-up.md`

---

### Step 2: Add Widgets to Your Documentation

Now add feedback widgets to your Markdown files.

#### 2.1 Manual method

At the **bottom** of any `.md` file, add:

```markdown
---

**Was this page helpful?**

[👍 Yes](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/your-file.md+👍&body=**Doc:**+docs/your-file.md%0A%0A**Vote:**+👍%0A%0A**Additional+comments+(optional):**%0A)
[👎 No](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/your-file.md+👎&body=**Doc:**+docs/your-file.md%0A%0A**Vote:**+👎%0A%0A**Additional+comments+(optional):**%0A)
```

**Important:** Replace `docs/your-file.md` with the actual path to your file.

#### 2.2 Using the widget generator (recommended)

```bash
npm run widget -- docs/your-file.md
```

This will output the correctly formatted widget for you to copy and paste.

#### 2.3 Example

For `docs/api.md`:

```markdown
# API Documentation

...your content...

---

**Was this page helpful?**

[👍 Yes](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/api.md+👍&body=**Doc:**+docs/api.md%0A%0A**Vote:**+👍%0A%0A**Additional+comments+(optional):**%0A)
[👎 No](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/api.md+👎&body=**Doc:**+docs/api.md%0A%0A**Vote:**+👎%0A%0A**Additional+comments+(optional):**%0A)
```

---

### Step 3: Configure Issue Labels

GitHub will create labels automatically when the first issue is opened, but you can create them manually for cleaner setup:

1. Go to your repository on GitHub
2. Click **Issues** → **Labels**
3. Create these labels:

| Label | Color | Description |
|-------|-------|-------------|
| `doc-feedback` | `#0E8A16` | Documentation feedback |
| `thumbs-up` | `#1D76DB` | Positive feedback |
| `thumbs-down` | `#D93F0B` | Negative feedback |

---

### Step 4: Commit and Push

```bash
git add .github/workflows/update-dashboard.yml
git add docs/  # or specific doc files you modified
git commit -m "Add doc feedback system"
git push
```

---

### Step 5: Verify Installation

#### 5.1 Check the workflow

1. Go to your repo on GitHub
2. Click **Actions** tab
3. You should see "Update Doc Feedback Dashboard" in the workflow list

#### 5.2 Manually trigger the workflow

1. In the **Actions** tab, click the workflow name
2. Click **Run workflow** → **Run workflow**
3. Wait for it to complete (should take ~30 seconds)
4. Check that `thumbs-up.md` was created in your repo root

#### 5.3 Test the widget

1. Navigate to one of your docs with a widget
2. Click the 👍 button
3. You should see a prefilled GitHub issue creation form
4. Submit the issue
5. Wait ~1 minute and refresh `thumbs-up.md`
6. Your vote should appear in the dashboard!

---

## Advanced Configuration

### Custom Dashboard Location

To change where the dashboard is generated, edit the workflow:

```yaml
- name: Generate dashboard
  run: npm run dashboard -- --output docs/feedback-dashboard.md
```

### Custom Update Frequency

Change the cron schedule in the workflow:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 0 * * 1'  # Weekly on Mondays
  # - cron: '0 0 1 * *'  # Monthly
```

### Bulk Add Widgets to Existing Docs

```bash
# Find all markdown files
find docs -name "*.md" -type f > doc-list.txt

# Generate widgets for all
npm run widget:bulk -- doc-list.txt
```

[See bulk operations guide →](USAGE.md#bulk-operations)

---

## Troubleshooting

### Dashboard not updating

**Problem:** The dashboard file isn't being created or updated.

**Solutions:**

1. Check workflow permissions:
   - Go to **Settings** → **Actions** → **General**
   - Under **Workflow permissions**, select **Read and write permissions**

2. Check workflow logs:
   - Go to **Actions** tab
   - Click the latest workflow run
   - Look for errors in the logs

3. Manually trigger the workflow:
   - **Actions** → Select workflow → **Run workflow**

### Widgets not rendering

**Problem:** The 👍/👎 links don't appear as buttons.

**Solutions:**

1. Ensure you're viewing on GitHub (not locally)
2. Check the Markdown syntax is correct
3. Verify the file path in the URL matches the actual file

### Issues not labeled correctly

**Problem:** New feedback issues don't have the right labels.

**Solutions:**

1. Check the widget URL includes: `labels=doc-feedback,thumbs-up`
2. Verify label names match exactly (case-sensitive)
3. Manually add labels to existing issues

### Workflow fails with permissions error

**Problem:** `Error: Resource not accessible by integration`

**Solution:**

Update workflow permissions:

```yaml
permissions:
  contents: write  # Must have write access
  issues: read
```

### Duplicate votes showing up

**Problem:** Same user's votes counted multiple times.

**Solution:**

The system deduplicates automatically. If seeing duplicates:

1. Check if issues have different timestamps
2. Verify the dashboard script is running the latest version
3. Manually close duplicate issues

---

## Uninstalling

To remove the feedback system:

1. Delete the workflow file:
   ```bash
   rm .github/workflows/update-dashboard.yml
   ```

2. Remove widgets from docs:
   ```bash
   # Manual: Delete the feedback section from each .md file
   ```

3. Delete the dashboard:
   ```bash
   rm thumbs-up.md
   ```

4. Close all feedback issues:
   - Go to **Issues**
   - Filter: `label:doc-feedback`
   - Close all issues

5. (Optional) Delete the labels:
   - Go to **Labels**
   - Delete `doc-feedback`, `thumbs-up`, `thumbs-down`

---

## Next Steps

- [Learn how to use the dashboard](USAGE.md)
- [Read the FAQ](FAQ.md)
- [See testing guidelines](TESTING.md)

---

**Still stuck?** [Open an issue](../../issues/new) and we'll help!
