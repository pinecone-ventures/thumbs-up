#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { fetchFeedbackIssues } = require('../src/github/issue-fetcher');
const { deduplicateVotes } = require('../src/core/deduplicator');
const { aggregateStats } = require('../src/core/aggregator');
const { buildDashboard } = require('../src/core/markdown-builder');

/**
 * Integration test for the full pipeline.
 * Tests with mock data from fixtures.
 */

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    testsFailed++;
  }
}

function assertEquals(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    console.error(`  Expected: ${expected}`);
    console.error(`  Actual: ${actual}`);
    testsFailed++;
  }
}

console.log('Running integration tests...\n');

// Test 1: Load fixture data
console.log('Test 1: Load fixture data');
const fixturesPath = path.join(__dirname, 'fixtures/issues-basic.json');
const fixtureData = fs.readFileSync(fixturesPath, 'utf8');
const issues = JSON.parse(fixtureData);
assert(Array.isArray(issues) && issues.length > 0, 'Loaded fixture data successfully');
console.log(`  Loaded ${issues.length} issues from fixture\n`);

// Test 2: Deduplication
console.log('Test 2: Deduplication');
const deduplicated = deduplicateVotes(issues);
assert(Array.isArray(deduplicated), 'Deduplicator returns an array');
assert(deduplicated.length <= issues.length, 'Deduplication reduces or maintains issue count');
console.log(`  Deduplicated ${issues.length} issues to ${deduplicated.length} votes\n`);

// Test 3: Aggregation
console.log('Test 3: Aggregation');
const stats = aggregateStats(deduplicated);
assert(typeof stats === 'object', 'Aggregator returns an object');
assert(Object.keys(stats).length > 0, 'Aggregator produces stats for at least one document');

// Check stats structure
const firstDoc = Object.keys(stats)[0];
const firstStats = stats[firstDoc];
assert('up' in firstStats, 'Stats include "up" count');
assert('down' in firstStats, 'Stats include "down" count');
assert('ratio' in firstStats, 'Stats include "ratio"');
assert('lastUpdated' in firstStats, 'Stats include "lastUpdated"');
console.log(`  Aggregated stats for ${Object.keys(stats).length} documents\n`);

// Test 4: Markdown building
console.log('Test 4: Markdown building');
const markdown = buildDashboard(stats);
assert(typeof markdown === 'string', 'Markdown builder returns a string');
assert(markdown.length > 0, 'Generated markdown is not empty');
assert(markdown.includes('# Documentation Feedback Dashboard'), 'Markdown includes header');
assert(markdown.includes('| Document |'), 'Markdown includes table header');
assert(markdown.includes('## Needs Attention'), 'Markdown includes Needs Attention section');
assert(markdown.includes('## Top Rated'), 'Markdown includes Top Rated section');
console.log(`  Generated ${markdown.length} characters of markdown\n`);

// Test 5: Full pipeline with issues-basic.json
console.log('Test 5: Full pipeline validation with issues-basic.json');
// Expected results based on issues-basic.json:
// - 4 issues total
// - docs/api.md: 1 up (alice), 1 down (bob)
// - README.md: 2 up (charlie, alice)
assertEquals(Object.keys(stats).length, 2, 'Stats contain 2 documents');

if (stats['docs/api.md']) {
  assertEquals(stats['docs/api.md'].up, 1, 'docs/api.md has 1 thumbs up');
  assertEquals(stats['docs/api.md'].down, 1, 'docs/api.md has 1 thumbs down');
  assertEquals(stats['docs/api.md'].ratio, 0.5, 'docs/api.md has 50% ratio');
}

if (stats['README.md']) {
  assertEquals(stats['README.md'].up, 2, 'README.md has 2 thumbs up');
  assertEquals(stats['README.md'].down, 0, 'README.md has 0 thumbs down');
  assertEquals(stats['README.md'].ratio, 1, 'README.md has 100% ratio');
}
console.log('');

// Test 6: Write output file
console.log('Test 6: Write dashboard to file');
const outputPath = path.join(__dirname, '../thumbs-up.test.md');
try {
  fs.writeFileSync(outputPath, markdown, 'utf8');
  assert(fs.existsSync(outputPath), 'Dashboard file written successfully');

  const writtenContent = fs.readFileSync(outputPath, 'utf8');
  assertEquals(writtenContent, markdown, 'Written content matches generated markdown');

  // Clean up test file
  fs.unlinkSync(outputPath);
  console.log('  Test file cleaned up\n');
} catch (error) {
  assert(false, `Failed to write dashboard file: ${error.message}`);
}

// Test 7: Error handling for issue-fetcher
console.log('Test 7: Issue fetcher error handling');
async function testIssueFetcherErrorHandling() {
  try {
    await fetchFeedbackIssues({ owner: '', repo: '', token: '' });
    assert(false, 'Should throw error for missing options');
  } catch (error) {
    assert(error.message.includes('required'), 'Throws error for missing options');
  }
}

// Run async test
testIssueFetcherErrorHandling().then(() => {
  console.log('');

  // Summary
  console.log('='.repeat(50));
  console.log('Integration Test Summary');
  console.log('='.repeat(50));
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log('='.repeat(50));

  if (testsFailed > 0) {
    console.error('\n❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
});
