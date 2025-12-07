# Frequently Asked Questions

Common questions about the Thumbs Up doc feedback system.

---

## General Questions

### What is Thumbs Up?

Thumbs Up is a zero-infrastructure documentation feedback system that uses GitHub Issues as a backend. It allows readers to vote 👍 or 👎 on your docs, and automatically aggregates feedback into a dashboard.

### Do I need to pay for anything?

No! The entire system runs on GitHub's free features:
- GitHub Issues (free)
- GitHub Actions (free tier: 2,000 minutes/month for private repos, unlimited for public)
- No external services

### Is this only for open source projects?

No! It works with:
- ✅ Public repositories
- ✅ Private repositories
- ✅ GitHub Enterprise
- ✅ Organization repositories

### How long does installation take?

Typically under 2 minutes:
1. Copy workflow file (30 seconds)
2. Add widget to a doc (30 seconds)
3. Commit and push (30 seconds)
4. Verify it works (30 seconds)

---

## Voting & Feedback

### Can users vote multiple times?

**Short answer:** Yes, but only the latest vote counts.

**How it works:**
- Users can click 👍 or 👎 multiple times
- Each click creates a new GitHub issue
- The dashboard deduplicates by **username + document**
- Only the **most recent vote** per user per doc is counted

**Example:**
1. User votes 👎 on `docs/api.md` (Monday)
2. User votes 👍 on `docs/api.md` (Tuesday)
3. Dashboard shows: 1 👍 for `docs/api.md`

### Is voting anonymous?

**Partially.** When a user clicks a widget:
- They create a GitHub issue
- GitHub records their username (if logged in)
- Anonymous visitors must log in to submit

**Privacy notes:**
- No IP addresses logged
- No cookies set
- No tracking pixels
- Only GitHub's native user metadata

### Can I vote on my own docs?

Yes! But it's typically not meaningful. The system is designed for reader feedback, not author self-assessment.

### What if someone spam votes?

You can:
1. **Close spam issues** - they won't count in the dashboard
2. **Delete spam issues** - removes them entirely
3. **Block abusive users** (GitHub's native blocking)
4. **Add rate limiting** (see [Customization](#custom-rate-limiting))

### Can users explain why they voted?

Yes! The issue template includes an optional "Additional comments" field:

```
**Doc:** docs/api.md

**Vote:** 👎

**Additional comments (optional):**
The examples don't work with version 2.0
```

---

## Dashboard & Updates

### How often does the dashboard update?

**Default:**
- **Real-time** when issues are opened/closed
- **Nightly** at midnight UTC
- **Manual** via workflow dispatch

You can customize the frequency (see [USAGE.md](USAGE.md#update-frequency)).

### Can I trigger updates manually?

Yes!

1. Go to **Actions** tab
2. Select "Update Doc Feedback Dashboard"
3. Click **Run workflow**
4. Wait ~30 seconds

### Where is the dashboard stored?

By default: `thumbs-up.md` in your repository root.

You can customize the location:

```yaml
- name: Generate dashboard
  run: npm run dashboard -- --output docs/feedback.md
```

### Can I view historical trends?

The dashboard shows current state, not history. To track trends:

1. **Git history:** View changes to `thumbs-up.md` over time
   ```bash
   git log -p thumbs-up.md
   ```

2. **Export data:** Export to CSV for analysis
   ```bash
   npm run export -- --format csv --output history.csv
   ```

3. **Custom script:** Query the GitHub API for historical issue data

### What happens to closed issues?

**Closed issues are excluded** from the dashboard by default.

Workflow:
1. User votes 👎 → Issue created
2. You fix the doc → Close the issue
3. Dashboard updates → Vote removed

To include closed issues, edit `src/github/issues.js`:

```javascript
const issues = await octokit.issues.listForRepo({
  owner,
  repo,
  labels: 'doc-feedback',
  state: 'all' // Include closed issues
});
```

---

## Technical Questions

### Does this work with GitHub Enterprise?

**Yes!** The system uses standard GitHub features available in Enterprise:
- GitHub Issues ✅
- GitHub Actions ✅
- Markdown rendering ✅

Just ensure your enterprise instance has Actions enabled.

### Can I use this with GitLab/Bitbucket?

**Not directly.** The system is designed for GitHub's issue and actions API.

However, you could adapt it:
- **GitLab:** Use GitLab Issues + CI/CD
- **Bitbucket:** Use Bitbucket Issues + Pipelines

The core logic in `src/core/` is GitHub-agnostic and could be reused.

### Does this work with Docusaurus/MkDocs/other doc tools?

**Yes!** As long as your docs are:
- Written in Markdown
- Rendered by GitHub (in the repo)

**Examples:**
- ✅ Docs in `/docs` folder on GitHub
- ✅ GitHub Wiki
- ✅ README.md files
- ❌ Docs only on external hosting (unless source is on GitHub)

### What are the GitHub API rate limits?

**GitHub Actions:**
- 1,000 requests/hour
- Plenty for typical usage

**Dashboard generation:**
- Fetches issues once per run
- Typical run: ~5-10 API calls
- Well within limits

If you hit limits, you can:
- Reduce update frequency
- Use conditional logic to skip unchanged docs

### Can I self-host this?

The system is already "self-hosted" in your GitHub repo!

If you mean running the dashboard generator locally:

```bash
npm install
GITHUB_TOKEN=ghp_your_token npm run dashboard
```

---

## Customization

### Can I customize the widget text?

Yes! See [USAGE.md - Widget Customization](USAGE.md#widget-customization).

**Example:**

```markdown
**Did you find this helpful?**

[👍 Absolutely!](...)
[👎 Not really](...)
```

### Can I use different emojis?

Yes!

```bash
npm run widget -- docs/api.md --up "✅" --down "❌"
```

**Output:**

```markdown
[✅ Yes](...)
[❌ No](...)
```

### Can I add more vote options?

**MVP:** Only 👍/👎 supported.

**Future:** You could extend it:

1. Add new labels: `thumbs-confusing`, `thumbs-outdated`
2. Add new widget buttons
3. Update aggregation logic

See [Contributing](../CONTRIBUTING.md) for how to extend.

### Can I change the dashboard format?

Yes! Edit `src/core/dashboard.js`.

**Example:** Add a pie chart using Mermaid:

```javascript
function generateChart(stats) {
  return `
\`\`\`mermaid
pie title Vote Distribution
    "👍 Positive" : ${stats.thumbsUp}
    "👎 Negative" : ${stats.thumbsDown}
\`\`\`
  `;
}
```

### Custom rate limiting?

Add a GitHub Action check:

```yaml
- name: Check for spam
  run: |
    # Limit issues per user per day
    npm run check:spam --max-per-user 10
```

---

## Common Issues

### Widgets aren't rendering as links

**Problem:** Seeing raw Markdown instead of clickable links.

**Causes:**
1. Viewing locally instead of on GitHub
2. Incorrect Markdown syntax
3. File not committed to GitHub

**Solution:**
1. Push to GitHub and view there
2. Check syntax: `[text](url)` with no spaces
3. Verify file is in the repo

### Dashboard is empty

**Problem:** `thumbs-up.md` exists but has no data.

**Causes:**
1. No feedback issues created yet
2. Issues don't have correct labels
3. Workflow hasn't run

**Solution:**
1. Create a test vote by clicking a widget
2. Check issue has labels: `doc-feedback`, `thumbs-up` or `thumbs-down`
3. Manually trigger workflow: **Actions** → **Run workflow**

### Workflow fails with "Permission denied"

**Problem:** `Error: Resource not accessible by integration`

**Cause:** Insufficient permissions.

**Solution:**

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions:**
   - Select **Read and write permissions**
   - Enable **Allow GitHub Actions to create and approve pull requests**

3. Or update workflow:
   ```yaml
   permissions:
     contents: write
     issues: read
   ```

### Duplicate votes showing up

**Problem:** Same vote counted multiple times.

**Causes:**
1. Issues created at different times (expected behavior)
2. Deduplication logic not running
3. Different usernames (anonymous vs logged in)

**Solution:**
1. Check if issues are from same user with `@username`
2. Verify dashboard script is latest version
3. Close duplicate issues manually

### Dashboard not committing

**Problem:** Workflow runs but `thumbs-up.md` not updated.

**Causes:**
1. No changes detected (dashboard unchanged)
2. Git config missing
3. Push failed

**Solution:**

Check workflow logs for:
```
nothing to commit, working tree clean
```

This is normal if no changes.

If failing to push:
```yaml
- name: Commit dashboard updates
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add thumbs-up.md
    git diff --quiet && git diff --staged --quiet || git commit -m "Update dashboard"
    git push
```

---

## Maintenance

### How do I archive old feedback?

**Option 1: Close issues**

Old issues automatically excluded from dashboard when closed.

**Option 2: Export and delete**

```bash
# Export to CSV
npm run export -- --format csv --output archive-2025.csv

# Close all old issues
gh issue list --label doc-feedback --state open \
  --json number --jq '.[].number' | \
  xargs -I {} gh issue close {}
```

**Option 3: Add "archived" label**

Filter in dashboard logic:

```javascript
const activeIssues = issues.filter(i =>
  !i.labels.some(l => l.name === 'archived')
);
```

### How do I reset all feedback?

**Warning:** This deletes all feedback data.

```bash
# Close all feedback issues
gh issue list --label doc-feedback --json number --jq '.[].number' | \
  xargs -I {} gh issue close {}

# Delete dashboard
git rm thumbs-up.md
git commit -m "Reset feedback system"
git push
```

### How much storage does this use?

**Minimal.** Each issue is ~1KB:
- 1,000 votes = ~1 MB
- GitHub Actions artifacts cleaned automatically
- Dashboard file typically < 10 KB

---

## Integration

### Can I integrate with Slack?

Yes! Add to your workflow:

```yaml
- name: Notify Slack on negative feedback
  if: github.event.label.name == 'thumbs-down'
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{
        "text": "New negative feedback: ${{ github.event.issue.title }}",
        "link": "${{ github.event.issue.html_url }}"
      }'
```

### Can I export to Google Sheets?

Yes! Use the export feature:

```bash
npm run export -- --format csv --output feedback.csv
```

Then:
1. Upload `feedback.csv` to Google Drive
2. Open with Google Sheets
3. Set up auto-import with Apps Script (optional)

### Can I use this with monitoring tools?

Yes! Export metrics:

```bash
# Get JSON summary
npm run dashboard -- --format json

# Output:
# {
#   "totalVotes": 47,
#   "avgSatisfaction": 0.78,
#   "topDoc": "docs/examples.md",
#   "bottomDoc": "docs/api/auth.md"
# }
```

Integrate with:
- Datadog
- Prometheus
- Grafana
- Custom dashboards

---

## Best Practices

### How often should I check the dashboard?

**Recommendation:**
- **Daily:** Quick glance for new critical issues
- **Weekly:** Review low-scoring docs, plan improvements
- **Monthly:** Analyze trends, celebrate wins

### Should I respond to every vote?

**No.** Respond to:
- ✅ Negative feedback with comments
- ✅ Questions or bug reports
- ✅ Patterns (multiple votes on same issue)
- ❌ Simple 👍 votes (no action needed)

### How many docs should have widgets?

**Best practice:**
- All user-facing documentation
- All README files
- API references
- Tutorials and guides

**Skip:**
- Internal notes
- Auto-generated docs (unless user-facing)
- Deprecated docs

### What's a good satisfaction score?

**Benchmarks:**
- **90%+** = Excellent
- **75-89%** = Good
- **60-74%** = Needs improvement
- **<60%** = Critical attention needed

**Note:** New docs may have volatile scores with low vote counts.

---

## Troubleshooting

### Still having issues?

1. **Check workflow logs:**
   - **Actions** tab → Latest run → View logs

2. **Verify setup:**
   ```bash
   npm run verify
   ```

3. **Test locally:**
   ```bash
   GITHUB_TOKEN=ghp_your_token npm run dashboard
   ```

4. **Ask for help:**
   - [Open an issue](../../issues/new)
   - Include workflow logs
   - Describe expected vs actual behavior

---

**More questions?** [Open an issue](../../issues/new) and we'll add it to this FAQ!
