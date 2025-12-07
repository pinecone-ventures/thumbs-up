/**
 * Widget Generator Tests
 *
 * Tests the widget generation logic including URL encoding and format validation.
 */

function encodeForURL(text) {
  return encodeURIComponent(text).replace(/%20/g, '+');
}

function generateWidget(docPath) {
  const encodedPath = encodeForURL(docPath);

  const thumbsUpLink = `../../issues/new?labels=doc-feedback,thumbs-up&title=Feedback:+${encodedPath}+👍&body=Doc:+${encodedPath}`;
  const thumbsDownLink = `../../issues/new?labels=doc-feedback,thumbs-down&title=Feedback:+${encodedPath}+👎&body=Doc:+${encodedPath}`;

  return `<!-- FEEDBACK -->
[👍 This doc was helpful](${thumbsUpLink})
[👎 This doc needs work](${thumbsDownLink})`;
}

// Test cases
const tests = [
  {
    name: 'Simple path without spaces',
    input: 'docs/api.md',
    expectedPath: 'docs%2Fapi.md'
  },
  {
    name: 'Path with spaces',
    input: 'docs/my file with spaces.md',
    expectedPath: 'docs%2Fmy+file+with+spaces.md'
  },
  {
    name: 'Nested path',
    input: 'examples/tutorials/advanced.md',
    expectedPath: 'examples%2Ftutorials%2Fadvanced.md'
  },
  {
    name: 'Path with special characters',
    input: 'docs/api-v2.0.md',
    expectedPath: 'docs%2Fapi-v2.0.md'
  }
];

let passed = 0;
let failed = 0;

console.log('Running Widget Generator Tests...\n');

tests.forEach(test => {
  const widget = generateWidget(test.input);
  const encodedPath = encodeForURL(test.input);

  // Check that widget contains all required components
  const hasComment = widget.includes('<!-- FEEDBACK -->');
  const hasThumbsUp = widget.includes('[👍 This doc was helpful]');
  const hasThumbsDown = widget.includes('[👎 This doc needs work]');
  const hasCorrectPath = widget.includes(test.expectedPath);
  const hasLabels = widget.includes('labels=doc-feedback,thumbs-up') &&
                    widget.includes('labels=doc-feedback,thumbs-down');
  const hasTitles = widget.includes(`title=Feedback:+${encodedPath}+👍`) &&
                    widget.includes(`title=Feedback:+${encodedPath}+👎`);
  const hasBodies = widget.includes(`body=Doc:+${encodedPath}`);

  const testPassed = hasComment && hasThumbsUp && hasThumbsDown &&
                     hasCorrectPath && hasLabels && hasTitles && hasBodies;

  if (testPassed) {
    console.log(`✓ ${test.name}`);
    passed++;
  } else {
    console.log(`✗ ${test.name}`);
    console.log(`  Input: ${test.input}`);
    console.log(`  Expected path: ${test.expectedPath}`);
    console.log(`  Has comment: ${hasComment}`);
    console.log(`  Has thumbs up: ${hasThumbsUp}`);
    console.log(`  Has thumbs down: ${hasThumbsDown}`);
    console.log(`  Has correct path: ${hasCorrectPath}`);
    console.log(`  Has labels: ${hasLabels}`);
    console.log(`  Has titles: ${hasTitles}`);
    console.log(`  Has bodies: ${hasBodies}`);
    failed++;
  }
});

console.log(`\n${passed} passed, ${failed} failed`);

// Test URL encoding specifically
console.log('\n--- URL Encoding Tests ---');

const urlTests = [
  { input: 'simple.md', expected: 'simple.md' },
  { input: 'with spaces.md', expected: 'with+spaces.md' },
  { input: 'with-dash.md', expected: 'with-dash.md' },
  { input: 'with_underscore.md', expected: 'with_underscore.md' },
  { input: 'with/slash.md', expected: 'with%2Fslash.md' }
];

let urlPassed = 0;
let urlFailed = 0;

urlTests.forEach(test => {
  const result = encodeForURL(test.input);
  if (result === test.expected) {
    console.log(`✓ "${test.input}" → "${result}"`);
    urlPassed++;
  } else {
    console.log(`✗ "${test.input}" → "${result}" (expected: "${test.expected}")`);
    urlFailed++;
  }
});

console.log(`\n${urlPassed} passed, ${urlFailed} failed`);

// Exit with error if any tests failed
if (failed > 0 || urlFailed > 0) {
  process.exit(1);
}

console.log('\nAll tests passed!');
