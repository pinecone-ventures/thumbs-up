# Testing Guide

Guide for developers contributing to the Thumbs Up project.

---

## Table of Contents

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Adding Tests](#adding-tests)
- [Testing GitHub Integration](#testing-github-integration)
- [Fixtures](#fixtures)
- [CI/CD](#cicd)

---

## Setup

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm 9+
- Git
- GitHub personal access token (for integration tests)

### Install Dependencies

```bash
npm install
npm install --save-dev jest
npm install --save-dev @octokit/rest
```

### Environment Variables

Create `.env.test`:

```bash
# Required for integration tests
GITHUB_TOKEN=ghp_your_personal_access_token

# Optional: Test against a specific repo
TEST_REPO_OWNER=your-username
TEST_REPO_NAME=test-repo
```

**Never commit `.env.test`!** It's already in `.gitignore`.

---

## Running Tests

### All Tests

```bash
npm test
```

### Unit Tests Only

```bash
npm run test:unit
```

**Unit tests:**
- Test pure functions
- No network calls
- Use fixtures
- Fast (< 1 second)

### Integration Tests

```bash
npm run test:integration
```

**Integration tests:**
- Test GitHub API interaction
- Require `GITHUB_TOKEN`
- Slower (5-10 seconds)
- Use a real test repository

### Watch Mode

```bash
npm run test:watch
```

Runs tests automatically when files change.

### Coverage

```bash
npm run test:coverage
```

Generates coverage report in `coverage/`.

**Target:** 80%+ coverage for core logic.

---

## Test Structure

```
tests/
├── unit/
│   ├── core/
│   │   ├── aggregator.test.js    # Vote aggregation logic
│   │   ├── dashboard.test.js     # Dashboard generation
│   │   └── deduplicator.test.js  # Deduplication logic
│   ├── cli/
│   │   └── widget.test.js        # Widget generator
│   └── utils/
│       └── validators.test.js    # Input validation
├── integration/
│   ├── github/
│   │   ├── issues.test.js        # GitHub API calls
│   │   └── workflow.test.js      # Full workflow test
│   └── e2e/
│       └── full-flow.test.js     # End-to-end test
└── fixtures/
    ├── issues/
    │   ├── positive-vote.json
    │   ├── negative-vote.json
    │   └── with-comments.json
    ├── repos/
    │   └── sample-repo.json
    └── expected/
        └── sample-dashboard.md
```

---

## Adding Tests

### 1. Unit Test Example

**File:** `tests/unit/core/aggregator.test.js`

```javascript
const { aggregateVotes } = require('../../../src/core/aggregator');

describe('aggregateVotes', () => {
  test('counts votes correctly', () => {
    const issues = [
      { labels: [{ name: 'thumbs-up' }], body: 'Doc: docs/api.md', user: { login: 'user1' } },
      { labels: [{ name: 'thumbs-down' }], body: 'Doc: docs/api.md', user: { login: 'user2' } },
      { labels: [{ name: 'thumbs-up' }], body: 'Doc: docs/api.md', user: { login: 'user3' } }
    ];

    const result = aggregateVotes(issues);

    expect(result).toEqual({
      'docs/api.md': {
        up: 2,
        down: 1,
        score: 0.67
      }
    });
  });

  test('deduplicates votes from same user', () => {
    const issues = [
      {
        labels: [{ name: 'thumbs-down' }],
        body: 'Doc: docs/api.md',
        user: { login: 'user1' },
        created_at: '2025-01-01T10:00:00Z'
      },
      {
        labels: [{ name: 'thumbs-up' }],
        body: 'Doc: docs/api.md',
        user: { login: 'user1' },
        created_at: '2025-01-01T11:00:00Z' // Later vote
      }
    ];

    const result = aggregateVotes(issues);

    expect(result).toEqual({
      'docs/api.md': {
        up: 1,
        down: 0,
        score: 1.0
      }
    });
  });

  test('handles empty issue list', () => {
    const result = aggregateVotes([]);
    expect(result).toEqual({});
  });

  test('ignores issues without doc path', () => {
    const issues = [
      { labels: [{ name: 'thumbs-up' }], body: 'No doc path here' }
    ];

    const result = aggregateVotes(issues);
    expect(result).toEqual({});
  });
});
```

### 2. Integration Test Example

**File:** `tests/integration/github/issues.test.js`

```javascript
const { fetchFeedbackIssues } = require('../../../src/github/issues');
require('dotenv').config({ path: '.env.test' });

describe('GitHub Issues Integration', () => {
  // Skip if no token
  const token = process.env.GITHUB_TOKEN;
  const runTests = token ? test : test.skip;

  runTests('fetches real issues from test repo', async () => {
    const issues = await fetchFeedbackIssues({
      owner: 'your-username',
      repo: 'test-repo',
      token
    });

    expect(Array.isArray(issues)).toBe(true);
    expect(issues.length).toBeGreaterThan(0);

    // Verify structure
    const issue = issues[0];
    expect(issue).toHaveProperty('number');
    expect(issue).toHaveProperty('title');
    expect(issue).toHaveProperty('body');
    expect(issue).toHaveProperty('labels');
    expect(issue).toHaveProperty('created_at');
  });

  runTests('filters by doc-feedback label', async () => {
    const issues = await fetchFeedbackIssues({
      owner: 'your-username',
      repo: 'test-repo',
      token
    });

    issues.forEach(issue => {
      const hasLabel = issue.labels.some(l => l.name === 'doc-feedback');
      expect(hasLabel).toBe(true);
    });
  });
});
```

### 3. End-to-End Test

**File:** `tests/integration/e2e/full-flow.test.js`

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config({ path: '.env.test' });

describe('Full Workflow', () => {
  const token = process.env.GITHUB_TOKEN;
  const runTests = token ? test : test.skip;

  runTests('generates dashboard from real issues', async () => {
    // Set environment
    process.env.GITHUB_TOKEN = token;
    process.env.GITHUB_REPOSITORY = 'your-username/test-repo';

    // Run dashboard generator
    execSync('npm run dashboard', { stdio: 'inherit' });

    // Verify dashboard was created
    expect(fs.existsSync('thumbs-up.md')).toBe(true);

    // Verify dashboard content
    const dashboard = fs.readFileSync('thumbs-up.md', 'utf-8');
    expect(dashboard).toContain('# Documentation Feedback Dashboard');
    expect(dashboard).toContain('Total feedback');
    expect(dashboard).toContain('Score');

    // Clean up
    fs.unlinkSync('thumbs-up.md');
  });
});
```

---

## Testing GitHub Integration

### Mock GitHub API (Unit Tests)

Use fixtures instead of real API calls:

```javascript
const mockOctokit = {
  issues: {
    listForRepo: jest.fn().mockResolvedValue({
      data: require('../../fixtures/issues/sample-issues.json')
    })
  }
};
```

### Real GitHub API (Integration Tests)

#### Setup Test Repository

1. Create a test repo: `your-username/thumbs-up-test`
2. Add test issues with labels:
   - `doc-feedback`
   - `thumbs-up` or `thumbs-down`
3. Use different docs: `docs/test1.md`, `docs/test2.md`

#### Create Test Issues

```bash
# Create positive vote
gh issue create \
  --repo your-username/thumbs-up-test \
  --label doc-feedback,thumbs-up \
  --title "Feedback: docs/test1.md 👍" \
  --body "Doc: docs/test1.md

Vote: 👍

Great documentation!"

# Create negative vote
gh issue create \
  --repo your-username/thumbs-up-test \
  --label doc-feedback,thumbs-down \
  --title "Feedback: docs/test2.md 👎" \
  --body "Doc: docs/test2.md

Vote: 👎

Needs more examples."
```

#### Run Integration Tests

```bash
GITHUB_TOKEN=ghp_your_token npm run test:integration
```

---

## Fixtures

### Creating Fixtures

Fixtures are sample data for testing without API calls.

#### Issue Fixture

**File:** `tests/fixtures/issues/positive-vote.json`

```json
{
  "number": 42,
  "title": "Feedback: docs/api.md 👍",
  "body": "**Doc:** docs/api.md\n\n**Vote:** 👍\n\n**Additional comments:**\nGreat examples!",
  "labels": [
    { "name": "doc-feedback" },
    { "name": "thumbs-up" }
  ],
  "user": {
    "login": "octocat"
  },
  "created_at": "2025-12-07T10:00:00Z",
  "html_url": "https://github.com/owner/repo/issues/42"
}
```

#### Expected Dashboard Fixture

**File:** `tests/fixtures/expected/sample-dashboard.md`

```markdown
# Documentation Feedback Dashboard

Last updated: 2025-12-07

## Summary

- **Total feedback**: 3 votes
- **Average satisfaction**: 67%
- **Docs tracked**: 2

## All Documents

| Document | 👍 | 👎 | Score | Total |
|----------|----|----|-------|-------|
| docs/api.md | 2 | 1 | 67% | 3 |
```

### Loading Fixtures in Tests

```javascript
const positiveVote = require('../../fixtures/issues/positive-vote.json');
const expectedDashboard = require('fs').readFileSync(
  '../../fixtures/expected/sample-dashboard.md',
  'utf-8'
);

test('generates correct dashboard', () => {
  const issues = [positiveVote];
  const dashboard = generateDashboard(issues);

  expect(dashboard).toBe(expectedDashboard);
});
```

---

## Validation Tests

Test input validation to prevent errors:

```javascript
const { validateDocPath, validateVote } = require('../../../src/utils/validators');

describe('Input Validation', () => {
  describe('validateDocPath', () => {
    test('accepts valid doc paths', () => {
      expect(validateDocPath('docs/api.md')).toBe(true);
      expect(validateDocPath('README.md')).toBe(true);
      expect(validateDocPath('guides/setup/index.md')).toBe(true);
    });

    test('rejects invalid paths', () => {
      expect(validateDocPath('../etc/passwd')).toBe(false); // Path traversal
      expect(validateDocPath('docs/api.exe')).toBe(false); // Not markdown
      expect(validateDocPath('')).toBe(false); // Empty
      expect(validateDocPath(null)).toBe(false); // Null
    });
  });

  describe('validateVote', () => {
    test('accepts valid votes', () => {
      expect(validateVote('up')).toBe(true);
      expect(validateVote('down')).toBe(true);
    });

    test('rejects invalid votes', () => {
      expect(validateVote('maybe')).toBe(false);
      expect(validateVote('spam')).toBe(false);
      expect(validateVote('')).toBe(false);
    });
  });
});
```

---

## Performance Tests

Test performance with large datasets:

```javascript
describe('Performance', () => {
  test('handles 1000 issues efficiently', () => {
    const issues = Array.from({ length: 1000 }, (_, i) => ({
      labels: [{ name: i % 2 === 0 ? 'thumbs-up' : 'thumbs-down' }],
      body: `Doc: docs/test${i % 10}.md`,
      user: { login: `user${i % 100}` },
      created_at: new Date(Date.now() - i * 1000).toISOString()
    }));

    const start = Date.now();
    const result = aggregateVotes(issues);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    expect(Object.keys(result).length).toBe(10); // 10 unique docs
  });
});
```

---

## CI/CD

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Generate coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Pre-commit Hooks

Install husky for pre-commit tests:

```bash
npm install --save-dev husky

# Setup
npx husky install
npx husky add .husky/pre-commit "npm run test:unit"
```

Now unit tests run automatically before each commit.

---

## Debugging Tests

### Debug Mode

```bash
# Enable verbose output
npm test -- --verbose

# Run a single test file
npm test -- tests/unit/core/aggregator.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="deduplicates"
```

### Using Debugger

Add `debugger;` statement in your test:

```javascript
test('debug this test', () => {
  const result = aggregateVotes(issues);
  debugger; // Execution pauses here
  expect(result).toBe(expected);
});
```

Run with:

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Open Chrome DevTools: `chrome://inspect`

---

## Common Test Patterns

### Testing Error Handling

```javascript
test('throws on invalid input', () => {
  expect(() => {
    aggregateVotes(null);
  }).toThrow('Issues must be an array');
});
```

### Testing Async Functions

```javascript
test('fetches issues asynchronously', async () => {
  const issues = await fetchFeedbackIssues({ owner, repo, token });
  expect(issues).toBeDefined();
});
```

### Testing File I/O

```javascript
const fs = require('fs');
const path = require('path');

test('writes dashboard to file', () => {
  const testFile = path.join(__dirname, 'test-dashboard.md');

  writeDashboard(testFile, content);

  expect(fs.existsSync(testFile)).toBe(true);

  // Clean up
  fs.unlinkSync(testFile);
});
```

---

## Best Practices

### Do:
- ✅ Write tests before code (TDD)
- ✅ Use descriptive test names
- ✅ Test edge cases (empty, null, invalid)
- ✅ Keep tests independent
- ✅ Use fixtures for consistent data
- ✅ Mock external dependencies (GitHub API)

### Don't:
- ❌ Test implementation details
- ❌ Make tests depend on each other
- ❌ Use real API keys in tests
- ❌ Commit test output files
- ❌ Skip error case testing

---

## Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Core logic | 95%+ |
| GitHub integration | 80%+ |
| CLI tools | 70%+ |
| Overall | 85%+ |

Check current coverage:

```bash
npm run test:coverage
```

Open `coverage/lcov-report/index.html` in browser for detailed view.

---

## Troubleshooting

### Tests failing locally but passing in CI

**Cause:** Environment differences.

**Solution:**
- Check Node.js version: `node --version`
- Clear cache: `npm cache clean --force`
- Delete `node_modules`: `rm -rf node_modules && npm install`

### GitHub API rate limit exceeded

**Cause:** Too many integration tests.

**Solution:**
- Use fixtures instead of real API
- Reduce integration test frequency
- Use authenticated requests (higher limit)

### Snapshot tests failing

**Cause:** Dashboard format changed.

**Solution:**
```bash
npm test -- --updateSnapshot
```

---

## Contributing Tests

When contributing:

1. **Add tests for new features:**
   ```javascript
   // src/new-feature.js
   function newFeature() { ... }

   // tests/unit/new-feature.test.js
   test('new feature works', () => { ... });
   ```

2. **Run all tests before submitting PR:**
   ```bash
   npm test
   ```

3. **Ensure coverage doesn't decrease:**
   ```bash
   npm run test:coverage
   ```

4. **Add integration tests for GitHub features:**
   ```javascript
   test('new GitHub integration works', async () => { ... });
   ```

---

**Questions?** [Open an issue](../../issues/new) or check the [main docs](../README.md).
