const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Load core modules
const { deduplicateVotes } = require('../src/core/deduplicator');
const { aggregateStats } = require('../src/core/aggregator');
const { buildDashboard } = require('../src/core/markdown-builder');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    testsFailed++;
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
  }
}

// Load fixtures
const fixturesDir = path.join(__dirname, 'fixtures');
const issuesBasic = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'issues-basic.json'), 'utf8'));
const issuesWithDupes = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'issues-with-dupes.json'), 'utf8'));
const issuesEdgeCases = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'issues-edge-cases.json'), 'utf8'));

console.log('\n=== Testing Deduplicator ===\n');

test('deduplicateVotes: handles empty array', () => {
  const result = deduplicateVotes([]);
  assert.strictEqual(result.length, 0);
});

test('deduplicateVotes: returns all issues when no duplicates', () => {
  const result = deduplicateVotes(issuesBasic);
  assert.strictEqual(result.length, 4);
});

test('deduplicateVotes: removes duplicates and keeps latest vote', () => {
  const result = deduplicateVotes(issuesWithDupes);

  // Should have 3 unique votes (alice on api.md, bob on api.md, charlie on README.md)
  assert.strictEqual(result.length, 3);

  // Alice's latest vote should be thumbs-down (id: 2, created Jan 15)
  const aliceVote = result.find(issue =>
    issue.user.login === 'alice' && issue.body.includes('docs/api.md')
  );
  assert.ok(aliceVote);
  assert.strictEqual(aliceVote.id, 2);
  assert.ok(aliceVote.labels.some(l => l.name === 'thumbs-down'));

  // Bob's latest vote should be thumbs-up (id: 4, created Jan 14)
  const bobVote = result.find(issue =>
    issue.user.login === 'bob' && issue.body.includes('docs/api.md')
  );
  assert.ok(bobVote);
  assert.strictEqual(bobVote.id, 4);
  assert.ok(bobVote.labels.some(l => l.name === 'thumbs-up'));

  // Charlie's latest vote should be thumbs-down (id: 6, created Jan 13)
  const charlieVote = result.find(issue =>
    issue.user.login === 'charlie' && issue.body.includes('README.md')
  );
  assert.ok(charlieVote);
  assert.strictEqual(charlieVote.id, 6);
  assert.ok(charlieVote.labels.some(l => l.name === 'thumbs-down'));
});

test('deduplicateVotes: handles malformed issues gracefully', () => {
  const malformed = [
    { id: 1, body: 'No doc field', user: { login: 'alice' }, created_at: '2025-01-15T10:00:00Z' },
    { id: 2, body: 'Doc: test.md', user: null, created_at: '2025-01-15T10:00:00Z' },
    { id: 3, body: 'Doc: valid.md', user: { login: 'bob' }, created_at: '2025-01-15T10:00:00Z' }
  ];

  const result = deduplicateVotes(malformed);
  assert.strictEqual(result.length, 1); // Only the valid one
  assert.strictEqual(result[0].id, 3);
});

console.log('\n=== Testing Aggregator ===\n');

test('aggregateStats: handles empty array', () => {
  const result = aggregateStats([]);
  assert.deepStrictEqual(result, {});
});

test('aggregateStats: correctly counts votes for basic issues', () => {
  const result = aggregateStats(issuesBasic);

  // docs/api.md: 1 up (alice), 1 down (bob)
  assert.ok(result['docs/api.md']);
  assert.strictEqual(result['docs/api.md'].up, 1);
  assert.strictEqual(result['docs/api.md'].down, 1);
  assert.strictEqual(result['docs/api.md'].ratio, 0.5);

  // README.md: 2 up (charlie, alice), 0 down
  assert.ok(result['README.md']);
  assert.strictEqual(result['README.md'].up, 2);
  assert.strictEqual(result['README.md'].down, 0);
  assert.strictEqual(result['README.md'].ratio, 1.0);
});

test('aggregateStats: correctly aggregates deduplicated votes', () => {
  const deduped = deduplicateVotes(issuesWithDupes);
  const result = aggregateStats(deduped);

  // After deduplication:
  // docs/api.md: alice (down), bob (up) = 1 up, 1 down
  assert.ok(result['docs/api.md']);
  assert.strictEqual(result['docs/api.md'].up, 1);
  assert.strictEqual(result['docs/api.md'].down, 1);
  assert.strictEqual(result['docs/api.md'].ratio, 0.5);

  // README.md: charlie (down) = 0 up, 1 down
  assert.ok(result['README.md']);
  assert.strictEqual(result['README.md'].up, 0);
  assert.strictEqual(result['README.md'].down, 1);
  assert.strictEqual(result['README.md'].ratio, 0);
});

test('aggregateStats: tracks most recent feedback timestamp', () => {
  const result = aggregateStats(issuesBasic);

  // docs/api.md: most recent is alice's vote on Jan 15
  assert.strictEqual(result['docs/api.md'].lastUpdated, '2025-01-15T10:00:00Z');

  // README.md: most recent is charlie's vote on Jan 13
  assert.strictEqual(result['README.md'].lastUpdated, '2025-01-13T10:00:00Z');
});

test('aggregateStats: handles edge cases', () => {
  const result = aggregateStats(issuesEdgeCases);

  // docs/guide.md: 1 up, 3 down = 25% ratio
  assert.ok(result['docs/guide.md']);
  assert.strictEqual(result['docs/guide.md'].up, 1);
  assert.strictEqual(result['docs/guide.md'].down, 3);
  assert.strictEqual(result['docs/guide.md'].ratio, 0.25);

  // docs/popular.md: 5 up, 0 down = 100% ratio
  assert.ok(result['docs/popular.md']);
  assert.strictEqual(result['docs/popular.md'].up, 5);
  assert.strictEqual(result['docs/popular.md'].down, 0);
  assert.strictEqual(result['docs/popular.md'].ratio, 1.0);
});

console.log('\n=== Testing Markdown Builder ===\n');

test('buildDashboard: generates valid markdown structure', () => {
  const stats = aggregateStats(issuesBasic);
  const markdown = buildDashboard(stats);

  assert.ok(markdown.includes('# Documentation Feedback Dashboard'));
  assert.ok(markdown.includes('Last updated:'));
  assert.ok(markdown.includes('| Document | 👍 | 👎 | Score | Last Feedback |'));
  assert.ok(markdown.includes('## Needs Attention'));
  assert.ok(markdown.includes('## Top Rated'));
});

test('buildDashboard: includes all documents in table', () => {
  const stats = aggregateStats(issuesBasic);
  const markdown = buildDashboard(stats);

  assert.ok(markdown.includes('docs/api.md'));
  assert.ok(markdown.includes('README.md'));
});

test('buildDashboard: calculates percentages correctly', () => {
  const stats = aggregateStats(issuesBasic);
  const markdown = buildDashboard(stats);

  // docs/api.md: 50%
  assert.ok(markdown.includes('50.0%'));

  // README.md: 100%
  assert.ok(markdown.includes('100.0%'));
});

test('buildDashboard: identifies documents needing attention', () => {
  const stats = aggregateStats(issuesEdgeCases);
  const markdown = buildDashboard(stats);

  // docs/guide.md has 25% ratio, should be in needs attention
  const needsSection = markdown.split('## Needs Attention')[1].split('##')[0];
  assert.ok(needsSection.includes('docs/guide.md'));
  assert.ok(needsSection.includes('25.0%'));
});

test('buildDashboard: identifies top rated documents', () => {
  const stats = aggregateStats(issuesEdgeCases);
  const markdown = buildDashboard(stats);

  // docs/popular.md has 100% with 5 votes, should be in top rated
  const topSection = markdown.split('## Top Rated')[1];
  assert.ok(topSection.includes('docs/popular.md'));
  assert.ok(topSection.includes('100.0%'));
});

test('buildDashboard: handles empty stats', () => {
  const markdown = buildDashboard({});

  assert.ok(markdown.includes('# Documentation Feedback Dashboard'));
  assert.ok(markdown.includes('No feedback data available'));
});

test('buildDashboard: sorts documents by score descending', () => {
  const stats = aggregateStats(issuesEdgeCases);
  const markdown = buildDashboard(stats);

  // Extract table rows
  const tableSection = markdown.split('|----------|----|----|-------|---------------|')[1].split('\n\n')[0];
  const rows = tableSection.trim().split('\n');

  // First row should be docs/popular.md (100%)
  assert.ok(rows[0].includes('docs/popular.md'));
  assert.ok(rows[0].includes('100.0%'));

  // Second row should be docs/guide.md (25%)
  assert.ok(rows[1].includes('docs/guide.md'));
  assert.ok(rows[1].includes('25.0%'));
});

console.log('\n=== Integration Tests ===\n');

test('Full pipeline: basic issues', () => {
  const deduped = deduplicateVotes(issuesBasic);
  const stats = aggregateStats(deduped);
  const markdown = buildDashboard(stats);

  assert.ok(markdown.length > 0);
  assert.ok(markdown.includes('docs/api.md'));
  assert.ok(markdown.includes('README.md'));
});

test('Full pipeline: issues with duplicates', () => {
  const deduped = deduplicateVotes(issuesWithDupes);
  const stats = aggregateStats(deduped);
  const markdown = buildDashboard(stats);

  assert.ok(markdown.length > 0);
  assert.strictEqual(deduped.length, 3); // Only 3 unique votes
});

test('Full pipeline: edge cases', () => {
  const deduped = deduplicateVotes(issuesEdgeCases);
  const stats = aggregateStats(deduped);
  const markdown = buildDashboard(stats);

  assert.ok(markdown.length > 0);
  assert.ok(markdown.includes('docs/guide.md'));
  assert.ok(markdown.includes('docs/popular.md'));
});

// Print summary
console.log('\n=== Test Summary ===\n');
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log(`Total tests: ${testsPassed + testsFailed}\n`);

if (testsFailed > 0) {
  process.exit(1);
}
