#!/usr/bin/env node

/**
 * Sets up required labels for the thumbs-up feedback system
 */

const { Octokit } = require('@octokit/rest');

const REQUIRED_LABELS = [
  {
    name: 'doc-feedback',
    description: 'Documentation feedback from readers',
    color: '0366d6'  // Blue
  },
  {
    name: 'thumbs-up',
    description: 'Positive documentation feedback',
    color: '28a745'  // Green
  },
  {
    name: 'thumbs-down',
    description: 'Negative documentation feedback',
    color: 'd73a49'  // Red
  }
];

async function setupLabels() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;

  if (!token || !repo) {
    console.error('Error: Missing GITHUB_TOKEN or GITHUB_REPOSITORY environment variables');
    console.error('\nUsage:');
    console.error('  GITHUB_TOKEN=xxx GITHUB_REPOSITORY=owner/repo node scripts/setup-labels.js');
    process.exit(1);
  }

  const [owner, repoName] = repo.split('/');

  const octokit = new Octokit({ auth: token });

  console.log(`Setting up labels for ${owner}/${repoName}...\n`);

  for (const label of REQUIRED_LABELS) {
    try {
      // Try to get the label first
      await octokit.rest.issues.getLabel({
        owner,
        repo: repoName,
        name: label.name
      });

      console.log(`✓ Label '${label.name}' already exists`);
    } catch (error) {
      if (error.status === 404) {
        // Label doesn't exist, create it
        try {
          await octokit.rest.issues.createLabel({
            owner,
            repo: repoName,
            name: label.name,
            description: label.description,
            color: label.color
          });

          console.log(`✓ Created label '${label.name}'`);
        } catch (createError) {
          console.error(`✗ Failed to create label '${label.name}':`, createError.message);
        }
      } else {
        console.error(`✗ Error checking label '${label.name}':`, error.message);
      }
    }
  }

  console.log('\nLabel setup complete!');
}

setupLabels();
