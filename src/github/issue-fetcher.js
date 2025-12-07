const { Octokit } = require('@octokit/rest');

/**
 * Fetches feedback issues from GitHub repository.
 *
 * @param {Object} options - Configuration options
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @param {string} options.token - GitHub API token
 * @returns {Promise<Array>} Array of issue objects matching the fixture format
 */
async function fetchFeedbackIssues(options) {
  const { owner, repo, token } = options;

  if (!owner || !repo || !token) {
    throw new Error('Missing required options: owner, repo, and token are required');
  }

  const octokit = new Octokit({
    auth: token
  });

  try {
    console.log(`Fetching feedback issues from ${owner}/${repo}...`);

    // Fetch all issues with doc-feedback label (both open and closed)
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      labels: 'doc-feedback',
      state: 'all',
      per_page: 100 // Adjust if you expect more than 100 feedback issues
    });

    console.log(`Found ${response.data.length} feedback issues`);

    // Debug: Log first few issues
    if (response.data.length > 0) {
      console.log('Sample issue:', JSON.stringify({
        id: response.data[0].id,
        title: response.data[0].title,
        labels: response.data[0].labels,
        body: response.data[0].body ? response.data[0].body.substring(0, 100) : null
      }, null, 2));
    }

    // Normalize to match fixture format
    const normalizedIssues = response.data.map(issue => ({
      id: issue.id,
      title: issue.title,
      labels: issue.labels.map(label => ({
        name: typeof label === 'string' ? label : label.name
      })),
      body: issue.body,
      user: {
        login: issue.user.login
      },
      created_at: issue.created_at
    }));

    // Filter out issues that don't have valid doc path or vote
    const validIssues = normalizedIssues.filter(issue => {
      const hasDocPath = issue.body && /Doc:\s*(.+)/.test(issue.body);
      const hasVote = issue.labels.some(label =>
        label.name === 'thumbs-up' || label.name === 'thumbs-down'
      );

      if (!hasDocPath || !hasVote) {
        console.log(`Skipping malformed issue #${issue.id}: ${issue.title}`);
        return false;
      }

      return true;
    });

    console.log(`Filtered to ${validIssues.length} valid feedback issues`);

    return validIssues;
  } catch (error) {
    if (error.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found or not accessible`);
    } else if (error.status === 401) {
      throw new Error('Invalid GitHub token or insufficient permissions');
    } else if (error.status === 403) {
      throw new Error('GitHub API rate limit exceeded or forbidden');
    } else {
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }
}

module.exports = { fetchFeedbackIssues };
