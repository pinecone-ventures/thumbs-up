/**
 * Builds a markdown dashboard from aggregated statistics.
 *
 * @param {Object} stats - Statistics object from aggregator
 * @returns {string} Markdown formatted dashboard
 */
function buildDashboard(stats) {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  let markdown = `# Documentation Feedback Dashboard\n\n`;
  markdown += `Last updated: ${now}\n\n`;

  // Convert stats to array and sort by score (descending)
  const entries = Object.entries(stats).map(([docPath, data]) => ({
    docPath,
    ...data
  })).sort((a, b) => b.ratio - a.ratio);

  if (entries.length === 0) {
    markdown += `No feedback data available.\n`;
    return markdown;
  }

  // Main table
  markdown += `| Document | 👍 | 👎 | Score | Last Feedback |\n`;
  markdown += `|----------|----|----|-------|---------------|\n`;

  for (const entry of entries) {
    const scorePercent = (entry.ratio * 100).toFixed(1);
    const lastFeedback = entry.lastUpdated.split('T')[0]; // Extract date only

    markdown += `| ${entry.docPath} | ${entry.up} | ${entry.down} | ${scorePercent}% | ${lastFeedback} |\n`;
  }

  markdown += `\n`;

  // Needs Attention section (< 50% score)
  const needsAttention = entries.filter(e => e.ratio < 0.5);

  markdown += `## Needs Attention\n\n`;

  if (needsAttention.length === 0) {
    markdown += `No documents need attention.\n\n`;
  } else {
    for (const entry of needsAttention) {
      const scorePercent = (entry.ratio * 100).toFixed(1);
      markdown += `- **${entry.docPath}** - ${scorePercent}% (${entry.up} up, ${entry.down} down)\n`;
    }
    markdown += `\n`;
  }

  // Top Rated section (> 90% score and >= 5 votes)
  const topRated = entries.filter(e => e.ratio > 0.9 && (e.up + e.down) >= 5);

  markdown += `## Top Rated\n\n`;

  if (topRated.length === 0) {
    markdown += `No documents meet top rated criteria (>90% score with >=5 votes).\n`;
  } else {
    for (const entry of topRated) {
      const scorePercent = (entry.ratio * 100).toFixed(1);
      markdown += `- **${entry.docPath}** - ${scorePercent}% (${entry.up} up, ${entry.down} down)\n`;
    }
  }

  return markdown;
}

module.exports = { buildDashboard };
