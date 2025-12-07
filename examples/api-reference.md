# API Reference

This document provides a reference for the thumbs-up feedback system components.

## Widget Generator CLI

### `generate-widget.js`

Generates feedback widget snippets for Markdown documentation.

#### Usage

```bash
npm run widget -- <document-path>
```

#### Arguments

- `document-path` (required): Relative path to the document from repository root

#### Examples

```bash
# Generate widget for a simple path
npm run widget -- docs/api.md

# Generate widget for a path with spaces
npm run widget -- "docs/my file with spaces.md"

# Generate widget for nested paths
npm run widget -- examples/tutorials/advanced.md
```

#### Output Format

The CLI outputs a ready-to-paste Markdown snippet:

```markdown
<!-- FEEDBACK -->
[👍 This doc was helpful](https://github.com/OWNER/REPO/issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+ENCODED_PATH+👍&body=Doc:+ENCODED_PATH)
[👎 This doc needs work](https://github.com/OWNER/REPO/issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+ENCODED_PATH+👎&body=Doc:+ENCODED_PATH)
```

#### URL Encoding

The generator automatically:
- URL-encodes special characters
- Converts spaces to `+` for readability
- Validates that paths don't start with `/`

## Issue Template

### `doc-feedback.yml`

GitHub Issue template for structured feedback collection.

#### Fields

- **Document Path** (required): Path to the document being reviewed
- **Sentiment** (required): Dropdown with 👍 Helpful or 👎 Needs improvement
- **Additional Notes** (optional): Free-text feedback

#### Labels Applied

- `doc-feedback`: Applied to all feedback issues
- `thumbs-up`: Applied when sentiment is positive
- `thumbs-down`: Applied when sentiment is negative

## Data Model

### Feedback Event

Each feedback submission creates a GitHub Issue with:

| Field | Source | Description |
|-------|--------|-------------|
| `doc` | Issue body or URL param | Path to the document |
| `vote` | Label (`thumbs-up`/`thumbs-down`) | User sentiment |
| `timestamp` | Issue `created_at` | When feedback was submitted |
| `notes` | Issue body | Optional user comments |

### Aggregations

The dashboard generator processes all `doc-feedback` issues to calculate:

- Total 👍 and 👎 per document
- Score = 👍 / (👍 + 👎)
- Most problematic docs (highest 👎 count)
- Most helpful docs (highest 👍 count)
- Total feedback volume

## File Structure

```
thumbs-up/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── doc-feedback.yml       # Issue template
│   │   └── config.yml              # Template config
│   └── workflows/
│       └── doc-feedback.yml        # Dashboard generator (future)
├── src/
│   └── cli/
│       └── generate-widget.js      # Widget generator CLI
├── examples/
│   ├── getting-started.md          # Example doc with widget
│   └── api-reference.md            # This file
└── package.json                     # npm scripts
```

## Best Practices

### Widget Placement

- Place widgets at the bottom of documentation files
- Use the `<!-- FEEDBACK -->` comment for easy searching
- Ensure proper spacing before the widget section

### Path Conventions

- Use relative paths from repository root
- Don't include leading slashes
- Use forward slashes even on Windows
- URL-encode special characters

### Feedback Management

- Review feedback issues regularly
- Close resolved issues with comments
- Use issue milestones to track documentation improvements
- Consider setting up automatic dashboard generation

---

<!-- FEEDBACK -->
[👍 This doc was helpful](https://github.com/pinecone-ventures/thumbs-up/issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+examples%2Fapi-reference.md+👍&body=Doc:+examples%2Fapi-reference.md)
[👎 This doc needs work](https://github.com/pinecone-ventures/thumbs-up/issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+examples%2Fapi-reference.md+👎&body=Doc:+examples%2Fapi-reference.md)
