# Widget Examples

Visual examples of how feedback widgets appear in different contexts.

---

## Standard Widget

The default widget appearance:

---

**Was this page helpful?**

[👍 Yes](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/example.md+👍&body=**Doc:**+docs/example.md%0A%0A**Vote:**+👍%0A%0A**Additional+comments:**%0A)
[👎 No](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/example.md+👎&body=**Doc:**+docs/example.md%0A%0A**Vote:**+👎%0A%0A**Additional+comments:**%0A)

---

**How it looks:**
- Two clickable links with emoji icons
- Clear text labels ("Yes" and "No")
- Separated by spacing
- Renders beautifully on GitHub

---

## Minimal Widget

For docs where space is tight:

---

[👍](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/example.md+👍&body=**Doc:**+docs/example.md)
[👎](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/example.md+👎&body=**Doc:**+docs/example.md)

---

**Use when:**
- Space is limited
- Context is clear
- Widget is at bottom of doc

---

## Detailed Widget

For docs where you want to encourage feedback:

---

## Feedback

We value your input! Your feedback helps us improve our documentation.

**Was this page helpful?**

[👍 Yes, this was clear and helpful](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/example.md+👍&body=**Doc:**+docs/example.md%0A%0A**Vote:**+👍%0A%0A**What+was+helpful?**%0A)
[👎 No, needs improvement](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/example.md+👎&body=**Doc:**+docs/example.md%0A%0A**Vote:**+👎%0A%0A**What+can+we+improve?**%0A)

*Your feedback is anonymous and helps us make better docs for everyone.*

---

**Use when:**
- First time adding widgets
- Complex documentation
- Want to encourage detailed feedback

---

## Custom Emoji Widget

Using different icons:

---

**Did you find what you needed?**

[✅ Yes, perfect!](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/example.md+✅&body=**Doc:**+docs/example.md)
[❌ No, needs work](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/example.md+❌&body=**Doc:**+docs/example.md)

---

**Alternative emojis:**
- ✅ / ❌ - Checkmark / X
- ⭐ / 💔 - Star / Broken heart
- 😊 / 😞 - Happy / Sad face
- ✓ / ✗ - Check / X mark

---

## Inline Widget

Within a section (less common):

---

### Installation Complete!

Congratulations! You've successfully installed the application.

**Was this installation guide helpful?** [👍 Yes](../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+docs/installation.md+👍&body=**Doc:**+docs/installation.md) | [👎 No](../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+docs/installation.md+👎&body=**Doc:**+docs/installation.md)

---

**Use when:**
- Specific section feedback
- Multiple widgets in one doc
- Embedded in content flow

---

## End-of-Tutorial Widget

For tutorial or guide docs:

---

## Congratulations! 🎉

You've completed this tutorial and learned how to:
- Set up the environment
- Run your first command
- Deploy to production

### Help us improve this tutorial

**How was your experience?**

[👍 Great! Clear and easy to follow](../../issues/new?labels=doc-feedback,thumbs-up,tutorial&title=Feedback:+tutorials/quickstart.md+👍&body=**Tutorial:**+tutorials/quickstart.md%0A%0A**Vote:**+👍%0A%0A**What+did+you+like?**%0A)
[👎 Confusing or incomplete](../../issues/new?labels=doc-feedback,thumbs-down,tutorial&title=Feedback:+tutorials/quickstart.md+👎&body=**Tutorial:**+tutorials/quickstart.md%0A%0A**Vote:**+👎%0A%0A**What+was+confusing?**%0A)

**Next:** [Advanced Topics](advanced.md) →

---

---

## What Happens When User Clicks?

### Step 1: User Clicks 👍

GitHub opens issue creation form with:

```
Title: Feedback: docs/example.md 👍

Labels: doc-feedback, thumbs-up

Body:
**Doc:** docs/example.md

**Vote:** 👍

**Additional comments:**
[User can type here]
```

### Step 2: User Submits

Issue is created in the repository.

### Step 3: Action Runs

GitHub Action automatically:
1. Detects new issue
2. Extracts vote data
3. Updates dashboard
4. Commits `thumbs-up.md`

### Step 4: Dashboard Updates

The vote appears in `thumbs-up.md`:

```markdown
| Document | 👍 | 👎 | Score | Issues |
|----------|----|----|-------|--------|
| docs/example.md | 1 | 0 | 100% | [View](link) |
```

---

## Best Practices

### Placement

**✅ Good:**
```markdown
# API Documentation

...all your content...

---

**Was this page helpful?**
[👍 Yes](...)
[👎 No](...)
```

**❌ Bad:**
```markdown
**Was this page helpful?** [👍](...)

# API Documentation  ← Widget before content

...content with widget in the middle...  ← Interrupts reading

[👍](...)  ← No context
```

### Wording

**✅ Good:**
- "Was this page helpful?"
- "Did this help?"
- "How was this guide?"

**❌ Bad:**
- "Click here" (not descriptive)
- "Vote now!!!" (too aggressive)
- Empty (no context)

### Frequency

**✅ One widget per document** - Place at the end

**❌ Multiple widgets** - Only if genuinely needed (e.g., multi-section tutorial)

---

## Customization Examples

### For API Docs

```markdown
---

## Feedback

**Was this API reference helpful?**

[👍 Yes, I found what I needed](...)
[👎 No, missing information](...)

*Help us improve: Tell us what's missing or unclear.*
```

### For Tutorials

```markdown
---

## You're Done! 🎉

**How was this tutorial?**

[👍 Clear and easy to follow](...)
[👎 Too complex or confusing](...)
```

### For Installation Guides

```markdown
---

## Installation Complete

**Did the installation work smoothly?**

[👍 Yes, no issues](...)
[👎 No, I encountered problems](...)

*If you had issues, please describe them in the feedback.*
```

### For Troubleshooting Docs

```markdown
---

**Did this solve your problem?**

[👍 Yes, issue resolved](...)
[👎 No, still stuck](...)
```

---

## Multi-Language Example

For international documentation:

### English

```markdown
**Was this page helpful?**

[👍 Yes](...)
[👎 No](...)
```

### Spanish

```markdown
**¿Te resultó útil esta página?**

[👍 Sí](...)
[👎 No](...)
```

### French

```markdown
**Cette page vous a-t-elle été utile ?**

[👍 Oui](...)
[👎 Non](...)
```

**Note:** Issue body should still use English for consistency in aggregation.

---

## Accessibility Considerations

Widgets are accessible by default:
- ✅ Clickable links (keyboard navigable)
- ✅ Clear text labels
- ✅ No JavaScript required
- ✅ Screen reader friendly

**For better accessibility:**

```markdown
**Was this page helpful?**

<a href="..." aria-label="This page was helpful">👍 Yes</a>
<a href="..." aria-label="This page needs improvement">👎 No</a>
```

---

## Testing Your Widget

After adding a widget:

1. **View on GitHub** - Widgets only render on GitHub, not locally
2. **Click the link** - Verify issue creation form opens
3. **Check prefilled data** - Title, labels, body should be correct
4. **Submit test vote** - Create a test issue
5. **Wait for Action** - Dashboard should update within 1 minute
6. **Verify dashboard** - Your vote should appear in `thumbs-up.md`

---

## Troubleshooting Widget Display

### Widget shows raw Markdown

**Problem:** Seeing `[👍](...)` instead of a clickable link.

**Solution:** View on GitHub, not in local editor.

### Link doesn't work

**Problem:** Clicking does nothing or shows 404.

**Solution:** Check the URL is correct:
```
../../issues/new?labels=doc-feedback,thumbs-up&title=...
```

### Issue body is malformed

**Problem:** Issue body doesn't match template.

**Solution:** Check URL encoding:
- Spaces: `%20` or `+`
- Newlines: `%0A`
- Colons: `%3A` (optional)

---

## Need Help?

- [Widget Generator](../README.md#step-2-add-widgets-to-your-docs)
- [Installation Guide](INSTALLATION.md)
- [FAQ](FAQ.md)

---

**Example Doc:** See this file's source to copy any widget style!
