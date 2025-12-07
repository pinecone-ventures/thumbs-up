#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { fetchFeedbackIssues } = require('../github/issue-fetcher');
const { deduplicateVotes } = require('../core/deduplicator');
const { aggregateStats } = require('../core/aggregator');
const { buildDashboard } = require('../core/markdown-builder');

/**
 * Main dashboard builder that orchestrates the full pipeline.
 * Supports two modes:
 * 1. Mock mode (--mock flag): Uses test fixtures for local testing
 * 2. GitHub mode: Fetches real data from GitHub API
 */
async function main() {
  const args = process.argv.slice(2);
  const isMockMode = args.includes('--mock');

  let issues = [];

  try {
    if (isMockMode) {
      console.log('Running in MOCK mode...');
      console.log('Reading test fixtures...');

      // Read from test fixtures
      const fixturesPath = path.join(__dirname, '../../test/fixtures/issues-basic.json');
      const fixtureData = fs.readFileSync(fixturesPath, 'utf8');
      issues = JSON.parse(fixtureData);

      console.log(`Loaded ${issues.length} issues from fixtures`);
    } else {
      console.log('Running in GITHUB mode...');

      // Validate environment variables
      const token = process.env.GITHUB_TOKEN;
      const repository = process.env.GITHUB_REPOSITORY;

      if (!token) {
        throw new Error('GITHUB_TOKEN environment variable is required');
      }

      if (!repository) {
        throw new Error('GITHUB_REPOSITORY environment variable is required (format: owner/repo)');
      }

      // Parse owner/repo
      const [owner, repo] = repository.split('/');

      if (!owner || !repo) {
        throw new Error('GITHUB_REPOSITORY must be in format: owner/repo');
      }

      // Fetch issues from GitHub
      issues = await fetchFeedbackIssues({ owner, repo, token });
    }

    // Run through the pipeline
    console.log('\nStep 1: Deduplicating votes...');
    const deduplicated = deduplicateVotes(issues);
    console.log(`Deduplicated ${issues.length} issues down to ${deduplicated.length} unique votes`);

    console.log('\nStep 2: Aggregating statistics...');
    const stats = aggregateStats(deduplicated);
    const docCount = Object.keys(stats).length;
    console.log(`Aggregated stats for ${docCount} documents`);

    console.log('\nStep 3: Building markdown dashboard...');
    const markdown = buildDashboard(stats);

    // Write to thumbs-up.md
    const outputPath = path.join(process.cwd(), 'thumbs-up.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');

    console.log(`\nDashboard written to: ${outputPath}`);
    console.log('\nPipeline completed successfully!');

    // Show a preview
    console.log('\n--- Dashboard Preview ---');
    console.log(markdown.split('\n').slice(0, 15).join('\n'));
    console.log('...\n');

  } catch (error) {
    console.error('\nError building dashboard:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the main function
main();
