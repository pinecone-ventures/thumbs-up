#!/usr/bin/env node

/**
 * Debug script to check what issues exist and their labels
 */

const { Octokit } = require('@octokit/rest');

async function debugIssues() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;

  if (!token || !repo) {
    console.error('Missing GITHUB_TOKEN or GITHUB_REPOSITORY environment variables');
    process.exit(1);
  }

  const [owner, repoName] = repo.split('/');

  const octokit = new Octokit({ auth: token });

  try {
    // Fetch all issues
    const allIssues = await octokit.rest.issues.listForRepo({
      owner,
      repo: repoName,
      state: 'all',
      per_page: 100
    });

    console.log(`\n=== All Issues (${allIssues.data.length}) ===`);
    allIssues.data.forEach(issue => {
      console.log(`\nIssue #${issue.number}: ${issue.title}`);
      console.log(`  State: ${issue.state}`);
      console.log(`  Labels: ${issue.labels.map(l => l.name).join(', ') || 'none'}`);
      console.log(`  Body preview: ${issue.body ? issue.body.substring(0, 100) : 'empty'}`);
    });

    // Try to fetch with doc-feedback label
    const feedbackIssues = await octokit.rest.issues.listForRepo({
      owner,
      repo: repoName,
      labels: 'doc-feedback',
      state: 'all',
      per_page: 100
    });

    console.log(`\n=== Issues with 'doc-feedback' label (${feedbackIssues.data.length}) ===`);
    feedbackIssues.data.forEach(issue => {
      console.log(`\nIssue #${issue.number}: ${issue.title}`);
      console.log(`  Labels: ${issue.labels.map(l => l.name).join(', ')}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugIssues();
