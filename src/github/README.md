# GitHub Integration Layer

This directory contains the GitHub API integration for the doc feedback system.

## Files

### issue-fetcher.js

Fetches feedback issues from a GitHub repository using the Octokit REST API.

**Function**: `fetchFeedbackIssues(options)`

**Parameters**:
- `options.owner` (string): Repository owner
- `options.repo` (string): Repository name
- `options.token` (string): GitHub API token

**Returns**: Promise that resolves to an array of normalized issue objects

**Features**:
- Queries issues with the `doc-feedback` label
- Includes both open AND closed issues (state: 'all')
- Normalizes GitHub API response to match the fixture format
- Filters out malformed issues (missing doc path or vote)
- Provides detailed error messages for common API errors (404, 401, 403)

**Example Usage**:

```javascript
const { fetchFeedbackIssues } = require('./src/github/issue-fetcher');

const issues = await fetchFeedbackIssues({
  owner: 'myorg',
  repo: 'myrepo',
  token: process.env.GITHUB_TOKEN
});

console.log(`Found ${issues.length} feedback issues`);
```

## Error Handling

The issue fetcher handles several common error scenarios:

- **Missing parameters**: Throws error if owner, repo, or token are not provided
- **404 Not Found**: Repository doesn't exist or is not accessible
- **401 Unauthorized**: Invalid or expired GitHub token
- **403 Forbidden**: Rate limit exceeded or insufficient permissions
- **Other errors**: Generic error message with details
