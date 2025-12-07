# Contributing to Thumbs Up

Thank you for your interest in contributing to Thumbs Up! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Code Style](#code-style)
- [Issue Guidelines](#issue-guidelines)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Assume good intentions
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

---

## Getting Started

### Ways to Contribute

- 🐛 **Report bugs** - Found an issue? [Open a bug report](../../issues/new?labels=bug)
- 💡 **Suggest features** - Have an idea? [Open a feature request](../../issues/new?labels=enhancement)
- 📝 **Improve documentation** - Fix typos, clarify instructions, add examples
- 🔧 **Submit code** - Fix bugs, implement features, improve performance
- 🧪 **Add tests** - Increase coverage, add edge cases
- 👀 **Review PRs** - Help review code from other contributors

### Good First Issues

New to the project? Look for issues labeled [`good-first-issue`](../../issues?q=is:issue+is:open+label:good-first-issue).

---

## Development Setup

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm 9+
- Git
- GitHub account
- GitHub personal access token (for testing GitHub integration)

### Fork and Clone

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/thumbs-up.git
   cd thumbs-up
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/pinecone-ventures/thumbs-up.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Create a test environment:**
   ```bash
   cp .env.example .env.test
   # Add your GITHUB_TOKEN to .env.test
   ```

### Verify Setup

```bash
# Run tests
npm run test:unit

# Generate a test widget
npm run widget -- docs/test.md

# Verify all scripts work
npm run verify
```

---

## Project Structure

```
thumbs-up/
├── src/
│   ├── core/              # Core business logic (GitHub-agnostic)
│   │   ├── aggregator.js       # Vote counting & aggregation
│   │   ├── dashboard.js        # Dashboard generation
│   │   └── deduplicator.js     # Vote deduplication
│   ├── github/            # GitHub API integration
│   │   ├── issues.js           # Fetch & parse issues
│   │   └── client.js           # Octokit wrapper
│   ├── cli/               # Command-line tools
│   │   ├── dashboard.js        # Generate dashboard
│   │   ├── generate-widget.js  # Widget generator
│   │   ├── widget-bulk.js      # Bulk operations
│   │   └── export.js           # Export data
│   └── utils/             # Shared utilities
│       ├── validators.js       # Input validation
│       └── formatters.js       # Output formatting
├── tests/
│   ├── unit/              # Unit tests (no network)
│   ├── integration/       # Integration tests (GitHub API)
│   └── fixtures/          # Test data
├── .github/
│   └── workflows/         # GitHub Actions workflows
├── docs/                  # Documentation
└── scripts/               # Build & utility scripts
```

### Architecture Principles

1. **Separation of concerns:**
   - `src/core/` = Pure functions, no I/O
   - `src/github/` = GitHub API interaction only
   - `src/cli/` = User interface, orchestration

2. **Testability:**
   - Core logic is pure and easily testable
   - GitHub integration uses dependency injection
   - Fixtures for consistent test data

3. **GitHub-native:**
   - No external services
   - Uses GitHub Issues as storage
   - GitHub Actions for automation

---

## Making Changes

### Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-123
```

**Branch naming:**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation only
- `test/description` - Test additions/fixes
- `refactor/description` - Code refactoring

### Make Your Changes

1. **Write code** following the [code style](#code-style)

2. **Add tests** for new functionality:
   ```javascript
   // tests/unit/core/new-feature.test.js
   describe('newFeature', () => {
     test('does what it should', () => {
       expect(newFeature(input)).toBe(expected);
     });
   });
   ```

3. **Update documentation** if needed:
   - Update README.md for user-facing changes
   - Update docs/ for detailed guides
   - Add JSDoc comments to functions

4. **Test your changes:**
   ```bash
   npm run test:unit
   npm run test:integration
   npm run lint
   ```

### Commit Messages

Use clear, descriptive commit messages:

```
Add widget customization options

- Allow custom emoji via --up and --down flags
- Support custom text via --text flag
- Add tests for new options

Fixes #123
```

**Format:**
- First line: Brief summary (50 chars or less)
- Blank line
- Detailed description (wrap at 72 chars)
- Reference issues: `Fixes #123` or `Relates to #456`

**Good examples:**
- `Fix dashboard crash with empty issues list`
- `Add bulk widget generation script`
- `Update installation guide for GitHub Enterprise`

**Bad examples:**
- `fix bug` (not descriptive)
- `WIP` (work in progress, should not be in main)
- `asdf` (meaningless)

---

## Testing

### Writing Tests

See [docs/TESTING.md](docs/TESTING.md) for comprehensive testing guide.

**Quick tips:**

1. **Unit tests for core logic:**
   ```javascript
   // tests/unit/core/aggregator.test.js
   test('aggregates votes correctly', () => {
     const issues = [/* test data */];
     const result = aggregateVotes(issues);
     expect(result).toEqual(expected);
   });
   ```

2. **Integration tests for GitHub API:**
   ```javascript
   // tests/integration/github/issues.test.js
   test('fetches real issues', async () => {
     const issues = await fetchFeedbackIssues({
       owner: 'test-owner',
       repo: 'test-repo',
       token: process.env.GITHUB_TOKEN
     });
     expect(issues).toBeDefined();
   });
   ```

3. **Use fixtures for consistency:**
   ```javascript
   const sampleIssues = require('../../fixtures/issues/sample.json');
   ```

### Running Tests

```bash
# All tests
npm test

# Unit tests only (fast)
npm run test:unit

# Integration tests (requires GITHUB_TOKEN)
npm run test:integration

# Watch mode (auto-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage

- Aim for **80%+ overall coverage**
- **95%+ for core logic** (src/core/)
- **70%+ for CLI tools** (src/cli/)

Check coverage:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## Submitting a Pull Request

### Before Submitting

- [ ] All tests pass: `npm test`
- [ ] Code is linted: `npm run lint`
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### Update Your Branch

```bash
git checkout main
git pull upstream main
git checkout your-branch
git rebase main
```

Fix any conflicts and test again.

### Push to Your Fork

```bash
git push origin your-branch
```

### Create the Pull Request

1. Go to the original repository on GitHub
2. Click "Pull requests" > "New pull request"
3. Click "compare across forks"
4. Select your fork and branch
5. Fill out the PR template:

```markdown
## Description

Brief description of what this PR does.

## Changes

- List of changes made
- Another change
- etc.

## Testing

How was this tested?
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manually tested

## Related Issues

Fixes #123
Relates to #456

## Screenshots (if applicable)

[Add screenshots for UI changes]

## Checklist

- [ ] Tests pass
- [ ] Code is linted
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)
```

### PR Review Process

1. **Automated checks run:**
   - Tests
   - Linting
   - Coverage

2. **Maintainers review:**
   - Code quality
   - Test coverage
   - Documentation
   - Architecture fit

3. **Feedback & iteration:**
   - Address review comments
   - Push updates to your branch
   - Re-request review

4. **Merge:**
   - Maintainer merges when approved
   - Your branch can be deleted

---

## Code Style

### General Principles

- **Readability over cleverness**
- **Consistency** with existing code
- **Simplicity** over complexity
- **Comments** for "why", not "what"

### JavaScript Style

We use Prettier for formatting and ESLint for linting.

**Format code:**
```bash
npm run format
```

**Lint code:**
```bash
npm run lint
```

**Key conventions:**

```javascript
// Use const/let, not var
const result = calculateScore(votes);
let count = 0;

// Use meaningful names
function aggregateVotes(issues) {  // Good
  // ...
}
function doStuff(x) {  // Bad
  // ...
}

// Use JSDoc for functions
/**
 * Aggregates votes from GitHub issues.
 *
 * @param {Array<Object>} issues - GitHub issues with doc-feedback label
 * @returns {Object} Aggregated vote counts per document
 */
function aggregateVotes(issues) {
  // ...
}

// Handle errors explicitly
try {
  const data = await fetchIssues();
  return data;
} catch (error) {
  console.error('Failed to fetch issues:', error.message);
  throw error;
}

// Validate inputs
function validateDocPath(path) {
  if (!path || typeof path !== 'string') {
    throw new Error('Doc path must be a non-empty string');
  }
  // ...
}
```

### File Organization

```javascript
// 1. Imports
const { Octokit } = require('@octokit/rest');
const { validateInput } = require('../utils/validators');

// 2. Constants
const DEFAULT_LABELS = ['doc-feedback'];

// 3. Main functions (exported)
async function fetchFeedbackIssues(options) {
  // ...
}

// 4. Helper functions (private)
function parseIssueBody(body) {
  // ...
}

// 5. Exports
module.exports = {
  fetchFeedbackIssues
};
```

---

## Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Run command '...'
2. See error

**Expected behavior**
What should happen?

**Actual behavior**
What actually happens?

**Environment**
- OS: [e.g., macOS 14.0]
- Node version: [e.g., 20.0.0]
- Thumbs Up version: [e.g., 1.0.0]

**Additional context**
Logs, screenshots, etc.
```

### Suggesting Features

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Mockups, examples, etc.
```

### Issue Labels

Maintainers will add labels:

| Label | Meaning |
|-------|---------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Improvements to docs |
| `good-first-issue` | Good for newcomers |
| `help-wanted` | Extra attention needed |
| `question` | Further information requested |
| `wontfix` | This will not be worked on |

---

## Communication

### Asking Questions

- **Documentation first** - Check README and docs/
- **Search issues** - Your question may be answered
- **Ask in discussions** - For general questions
- **Open an issue** - For specific problems

### Getting Help

Stuck? Here's how to get help:

1. **Read the docs:**
   - [README.md](README.md)
   - [docs/INSTALLATION.md](docs/INSTALLATION.md)
   - [docs/FAQ.md](docs/FAQ.md)

2. **Check existing issues:**
   - [All issues](../../issues)
   - [Closed issues](../../issues?q=is:issue+is:closed)

3. **Ask in your PR:**
   - Tag maintainers: `@maintainer-name`
   - Explain what you tried

4. **Open a question issue:**
   - Label it `question`
   - Provide context

---

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.x.x`
4. Push tag: `git push --tags`
5. GitHub Action publishes release

---

## Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes for significant contributions
- README.md acknowledgments section

---

## Questions?

- Open an issue with the `question` label
- Tag `@maintainer` in discussions
- Check [docs/FAQ.md](docs/FAQ.md)

---

**Thank you for contributing to Thumbs Up!** Your efforts help maintainers build better documentation for everyone.
