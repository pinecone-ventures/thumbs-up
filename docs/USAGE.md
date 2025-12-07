# Usage Guide

How to effectively use the Thumbs Up doc feedback system.

---

## Table of Contents

- [Generating Widgets](#generating-widgets)
- [Interpreting the Dashboard](#interpreting-the-dashboard)
- [Handling Feedback Issues](#handling-feedback-issues)
- [Customization](#customization)
- [Bulk Operations](#bulk-operations)
- [Best Practices](#best-practices)

---

## Generating Widgets

### Single Widget

Generate a widget for one document:

```bash
npm run widget -- docs/api.md
```

**Output:**

```markdown
---

**Was this page helpful?**

[👍 Yes](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/api.md+👍&body=**Doc:**+docs/api.md%0A%0A**Vote:**+👍%0A%0A**Additional+comments+(optional):**%0A)
[👎 No](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/api.md+👎&body=**Doc:**+docs/api.md%0A%0A**Vote:**+👎%0A%0A**Additional+comments+(optional):**%0A)
```

Copy and paste this at the bottom of your document.

### Custom Widget Text

Customize the prompt text:

```bash
npm run widget -- docs/api.md --text "Did this help?"
```

**Output:**

```markdown
**Did this help?**

[👍 Yes](...)
[👎 No](...)
```

### Different Emoji

Use different icons:

```bash
npm run widget -- docs/api.md --up "✅" --down "❌"
```

### Widget Variations

#### Minimal (no text)

```markdown
[👍](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/api.md+👍&body=**Doc:**+docs/api.md)
[👎](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/api.md+👎&body=**Doc:**+docs/api.md)
```

#### Detailed (with context)

```markdown
---

## Feedback

We value your input! Let us know if this documentation was helpful.

**Was this page helpful?**

[👍 Yes, this was clear and helpful](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/api.md+👍&body=**Doc:**+docs/api.md%0A%0A**Vote:**+👍%0A%0A**What+was+helpful?**%0A)
[👎 No, needs improvement](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/api.md+👎&body=**Doc:**+docs/api.md%0A%0A**Vote:**+👎%0A%0A**What+can+we+improve?**%0A)

*Your feedback helps us improve our documentation. Thank you!*
```

---

## Interpreting the Dashboard

The auto-generated `thumbs-up.md` provides actionable insights.

### Dashboard Structure

```markdown
# Documentation Feedback Dashboard

Last updated: 2025-12-07 14:23 UTC

## Summary

- **Total feedback**: 47 votes across 12 documents
- **Average satisfaction**: 78%
- **Recent activity**: 8 votes in last 7 days

## Docs Needing Attention 🔥

Documents with low satisfaction or high volume of negative feedback.

| Document | 👍 | 👎 | Score | Total | Issues |
|----------|----|----|-------|-------|--------|
| docs/api/authentication.md | 3 | 8 | 27% | 11 | [View](../../issues?q=is:issue+label:doc-feedback+authentication.md) |
| docs/quickstart.md | 5 | 4 | 56% | 9 | [View](../../issues?q=is:issue+label:doc-feedback+quickstart.md) |

## Top Rated Docs ⭐

Your best documentation - keep up the good work!

| Document | 👍 | 👎 | Score | Total | Issues |
|----------|----|----|-------|-------|--------|
| docs/examples.md | 12 | 1 | 92% | 13 | [View](../../issues?q=is:issue+label:doc-feedback+examples.md) |
| README.md | 8 | 1 | 89% | 9 | [View](../../issues?q=is:issue+label:doc-feedback+README.md) |

## All Documents

Sorted by feedback volume.

| Document | 👍 | 👎 | Score | Total | Issues |
|----------|----|----|-------|-------|--------|
| docs/examples.md | 12 | 1 | 92% | 13 | [View](...) |
| docs/api/authentication.md | 3 | 8 | 27% | 11 | [View](...) |
| ... | ... | ... | ... | ... | ... |
```

### Key Metrics

#### Score

**Formula:** `(👍 votes) / (👍 + 👎) × 100%`

- **90-100%**: Excellent documentation
- **70-89%**: Good, minor improvements possible
- **50-69%**: Needs attention
- **< 50%**: High priority for revision

#### Total Volume

High volume indicates:
- Popular/frequently accessed doc
- More statistical significance
- Higher confidence in the score

#### Recent Activity

Shows docs with recent feedback:
- Fresh signals from users
- May indicate recent changes
- Opportunity for quick wins

### What to Focus On

**Priority 1: Low score + High volume**
- Many users are struggling
- High impact if you fix it
- Example: Authentication guide with 8 thumbs down

**Priority 2: Low score + Recent activity**
- New pain point
- Quick to address while context is fresh
- Example: Newly updated tutorial with negative feedback

**Priority 3: Zero feedback**
- No one is reading it, or
- No one can find the widget, or
- Doc is perfect (unlikely!)

---

## Handling Feedback Issues

### Viewing Feedback

Click the "View" link in the dashboard to see all issues for a doc:

```
https://github.com/your-org/your-repo/issues?q=is:issue+label:doc-feedback+api.md
```

### Reading User Comments

When users submit feedback, they can add optional comments:

**Example issue body:**

```
**Doc:** docs/api/authentication.md

**Vote:** 👎

**Additional comments (optional):**
The example code doesn't work with the latest version.
The environment variables are missing from the setup section.
```

### Responding to Feedback

You can:

1. **Comment on the issue**
   - Ask for clarification
   - Thank the user
   - Explain upcoming changes

2. **Reference the issue in PRs**
   - "Fixes #123" in commit message
   - Automatically closes issue when merged

3. **Close the issue**
   - After fixing the doc
   - If feedback is addressed
   - If issue is spam/invalid

### Triaging Feedback

Add additional labels to organize:

- `good-first-issue` - Easy doc fixes for new contributors
- `help-wanted` - Need subject matter expert input
- `wontfix` - Intentional design decision
- `duplicate` - Same as another issue

### Example Workflow

1. **Morning routine:**
   - Check `thumbs-up.md` for new red flags
   - Review issues from last 24 hours

2. **Weekly review:**
   - Look at docs with lowest scores
   - Plan doc improvement sprints
   - Assign issues to team members

3. **Monthly:**
   - Celebrate docs with high scores
   - Archive closed feedback
   - Analyze trends over time

---

## Customization

### Dashboard Appearance

#### Custom Thresholds

Edit `src/core/dashboard.js`:

```javascript
const THRESHOLDS = {
  excellent: 0.85,     // 85% and above
  good: 0.70,         // 70-84%
  needsAttention: 0.50 // Below 50%
};
```

#### Custom Sections

Add a section for "zero feedback" docs:

```javascript
// In src/core/dashboard.js
function generateZeroFeedbackSection(docs) {
  const noFeedback = docs.filter(d => d.total === 0);
  return `
## Docs Without Feedback

These docs haven't received any feedback yet.

${noFeedback.map(d => `- ${d.path}`).join('\n')}
  `;
}
```

#### Custom Emojis

Change the section headers:

```javascript
const SECTION_TITLES = {
  needsAttention: '## 🚨 Critical Issues',
  topRated: '## 🏆 Hall of Fame',
  recent: '## 🔔 Latest Feedback'
};
```

### Widget Customization

#### Template Override

Create `.thumbs-up/widget-template.md`:

```markdown
---

### Your Feedback Matters

Rate this documentation:

[👍 Helpful](THUMBS_UP_URL)
[👎 Needs Work](THUMBS_DOWN_URL)
```

Then run:

```bash
npm run widget -- docs/api.md --template .thumbs-up/widget-template.md
```

#### Issue Template

Customize the issue body by creating `.github/ISSUE_TEMPLATE/doc-feedback.yml`:

```yaml
name: Documentation Feedback
description: Provide feedback on our documentation
labels: ["doc-feedback"]
body:
  - type: input
    id: doc-path
    attributes:
      label: Document Path
      description: Which document are you providing feedback on?
      placeholder: docs/api.md
    validations:
      required: true

  - type: dropdown
    id: vote
    attributes:
      label: Vote
      options:
        - 👍 Helpful
        - 👎 Needs Work
    validations:
      required: true

  - type: textarea
    id: comments
    attributes:
      label: Comments
      description: What can we improve? (optional)
      placeholder: The examples were unclear...

  - type: checkboxes
    id: issues
    attributes:
      label: Issues Found
      options:
        - label: Outdated information
        - label: Missing examples
        - label: Confusing wording
        - label: Technical errors
        - label: Other
```

### Update Frequency

#### Real-time (on every issue)

Already configured by default:

```yaml
on:
  issues:
    types: [opened, closed, labeled]
```

#### Hourly

```yaml
schedule:
  - cron: '0 * * * *'
```

#### Weekly

```yaml
schedule:
  - cron: '0 0 * * 1'  # Mondays at midnight
```

#### Manual only

```yaml
on:
  workflow_dispatch:
```

---

## Bulk Operations

### Add Widgets to All Docs

```bash
# Find all markdown files
find docs -name "*.md" -type f > doc-list.txt

# Generate widgets
npm run widget:bulk -- doc-list.txt

# Or with custom template
npm run widget:bulk -- doc-list.txt --template .thumbs-up/template.md
```

This will:
1. Read each file path
2. Generate the widget
3. Append to the file (or create a file with widgets to manually merge)

### Remove All Widgets

```bash
# Dry run - preview what will be removed
npm run widget:remove -- docs/ --dry-run

# Actually remove
npm run widget:remove -- docs/
```

### Export Feedback Data

```bash
# Export to JSON
npm run export -- --format json --output feedback.json

# Export to CSV
npm run export -- --format csv --output feedback.csv
```

**CSV output:**

```csv
doc,vote,user,timestamp,comments
docs/api.md,up,octocat,2025-12-07T10:00:00Z,"Great examples"
docs/api.md,down,user123,2025-12-07T11:00:00Z,"Missing auth section"
```

---

## Best Practices

### Widget Placement

**✅ Do:**
- Place at the bottom of the doc
- After all content but before footer links
- After a horizontal rule (`---`)

**❌ Don't:**
- Place in the middle of content
- Before the main content
- In code blocks or tables

### Responding to Feedback

**✅ Do:**
- Acknowledge negative feedback quickly
- Ask for clarification when needed
- Thank users for their input
- Close issues when fixed

**❌ Don't:**
- Argue with users about their experience
- Leave feedback unanswered for weeks
- Close issues without addressing them
- Delete feedback you disagree with

### Dashboard Monitoring

**Weekly:**
- Review new low-scoring docs
- Check for patterns in comments
- Celebrate improvements

**Monthly:**
- Track score trends over time
- Identify docs that need rewrites
- Share wins with the team

**Quarterly:**
- Analyze overall doc health
- Plan major doc improvements
- Review unused docs (zero feedback)

### Maintaining Quality

1. **Close the loop:**
   - Fix the doc → Close the issue → Thank the user

2. **Track changes:**
   - Link PRs to feedback issues
   - Document what you changed

3. **Prevent regression:**
   - Monitor scores after updates
   - Keep widgets on updated docs

4. **Celebrate wins:**
   - Share high scores with team
   - Use metrics in reports
   - Highlight top docs in README

---

## Examples

### Example 1: Handling Negative Feedback

**Issue #42:** docs/api.md - 👎

**Comment:**
> The authentication section is confusing. I couldn't get my API key to work.

**Response:**

1. Comment on issue:
   ```
   Thanks for the feedback! Can you share:
   - Which step failed?
   - What error message did you see?
   ```

2. User responds with details

3. Fix the doc:
   - Add clearer steps
   - Include error troubleshooting
   - Add working example

4. Create PR:
   ```
   Fix authentication docs based on user feedback

   - Clarified API key setup steps
   - Added troubleshooting section
   - Included working curl example

   Fixes #42
   ```

5. PR merged → Issue auto-closed → Dashboard updated

### Example 2: Bulk Widget Addition

**Scenario:** Adding widgets to 50 existing docs

```bash
# 1. Find all docs
find docs -name "*.md" -type f > all-docs.txt

# 2. Preview first 5
head -5 all-docs.txt

# 3. Generate widgets
npm run widget:bulk -- all-docs.txt --output widgets-to-add.md

# 4. Review the output
cat widgets-to-add.md

# 5. Manually add to each file or use script
npm run widget:append -- all-docs.txt

# 6. Commit
git add docs/
git commit -m "Add feedback widgets to all documentation"
git push
```

### Example 3: Custom Dashboard

**Goal:** Add a "Recent Changes" section

Edit `src/core/dashboard.js`:

```javascript
function generateRecentChanges(issues) {
  const recentIssues = issues
    .filter(i => {
      const age = Date.now() - new Date(i.created_at);
      return age < 7 * 24 * 60 * 60 * 1000; // Last 7 days
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return `
## Recent Changes 🔔

Feedback from the last 7 days:

${recentIssues.map(i => `
- **${i.doc}** - ${i.vote === 'up' ? '👍' : '👎'} by @${i.user} - [View](${i.url})
  ${i.comments ? `  > "${i.comments}"` : ''}
`).join('\n')}
  `;
}
```

---

## Advanced Tips

### Integrating with CI/CD

Add a check to fail builds if doc satisfaction is too low:

```yaml
- name: Check doc health
  run: |
    npm run dashboard:check --min-score 0.60
    # Fails if any doc scores below 60%
```

### Automated Alerts

Send Slack notifications for negative feedback:

```yaml
- name: Alert on negative feedback
  if: github.event.label.name == 'thumbs-down'
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -d '{"text":"New negative feedback on docs: ${{ github.event.issue.title }}"}'
```

### Analytics Integration

Export data to your analytics platform:

```bash
npm run export -- --format json | \
  curl -X POST https://your-analytics.com/api/events \
    -H "Content-Type: application/json" \
    -d @-
```

---

**Next:** [See the FAQ](FAQ.md) for common questions
