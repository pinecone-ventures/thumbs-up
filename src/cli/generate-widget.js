#!/usr/bin/env node

/**
 * Widget Generator CLI
 *
 * Generates feedback widget snippets for Markdown documentation.
 *
 * Usage:
 *   npm run widget -- docs/api.md
 *   node src/cli/generate-widget.js docs/api.md
 *
 * Output: Markdown snippet ready to paste into documentation
 */

function encodeForURL(text) {
  // URL encode the path for use in query parameters
  return encodeURIComponent(text).replace(/%20/g, '+');
}

function validatePath(path) {
  // Ensure path doesn't start with /
  if (path.startsWith('/')) {
    console.error('\nError: Path should not start with "/". Use relative paths from repo root.');
    console.error('Example: docs/api.md (not /docs/api.md)\n');
    return false;
  }
  return true;
}

function generateWidget(docPath) {
  const encodedPath = encodeForURL(docPath);

  const thumbsUpLink = `../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+${encodedPath}+👍&body=Doc:+${encodedPath}`;
  const thumbsDownLink = `../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+${encodedPath}+👎&body=Doc:+${encodedPath}`;

  return `<!-- FEEDBACK -->
[👍 This doc was helpful](${thumbsUpLink})
[👎 This doc needs work](${thumbsDownLink})`;
}

function printUsage() {
  console.log(`
========================================
Feedback Widget Generator
========================================

Usage:
  npm run widget -- <document-path>
  node src/cli/generate-widget.js <document-path>

Examples:
  npm run widget -- docs/api.md
  npm run widget -- "docs/my file with spaces.md"
  npm run widget -- examples/getting-started.md

The document path should be relative to your repository root.
========================================
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('\nError: Missing document path argument.\n');
    printUsage();
    process.exit(1);
  }

  const docPath = args[0];

  if (!validatePath(docPath)) {
    process.exit(1);
  }

  console.log(`
========================================
Feedback Widget for: ${docPath}
========================================
Copy and paste this at the bottom of your Markdown file:

${generateWidget(docPath)}
========================================
`);
}

// Run the CLI
main();
