/**
 * Aggregates feedback statistics by document.
 *
 * @param {Array} issues - Array of deduplicated GitHub issue objects
 * @returns {Object} Statistics object with format:
 *   { [docPath]: { up: number, down: number, ratio: number, lastUpdated: string } }
 */
function aggregateStats(issues) {
  if (!Array.isArray(issues) || issues.length === 0) {
    return {};
  }

  // Extract doc path from issue body
  const getDocPath = (issue) => {
    const match = issue.body?.match(/Doc:\s*(.+)/);
    return match ? match[1].trim() : null;
  };

  // Check if issue has thumbs-up label
  const hasThumbsUp = (issue) => {
    return issue.labels?.some(label => label.name === 'thumbs-up');
  };

  // Check if issue has thumbs-down label
  const hasThumbsDown = (issue) => {
    return issue.labels?.some(label => label.name === 'thumbs-down');
  };

  const stats = {};

  for (const issue of issues) {
    const docPath = getDocPath(issue);

    if (!docPath) {
      continue; // Skip malformed issues
    }

    if (!stats[docPath]) {
      stats[docPath] = {
        up: 0,
        down: 0,
        ratio: 0,
        lastUpdated: issue.created_at
      };
    }

    // Count the vote
    if (hasThumbsUp(issue)) {
      stats[docPath].up++;
    } else if (hasThumbsDown(issue)) {
      stats[docPath].down++;
    }

    // Update lastUpdated to most recent timestamp
    const currentTimestamp = new Date(stats[docPath].lastUpdated);
    const issueTimestamp = new Date(issue.created_at);

    if (issueTimestamp > currentTimestamp) {
      stats[docPath].lastUpdated = issue.created_at;
    }
  }

  // Calculate ratios
  for (const docPath in stats) {
    const { up, down } = stats[docPath];
    const total = up + down;

    if (total > 0) {
      stats[docPath].ratio = up / total;
    } else {
      stats[docPath].ratio = 0;
    }
  }

  return stats;
}

module.exports = { aggregateStats };
