/**
 * Deduplicates feedback votes by keeping only the most recent vote
 * per user per document.
 *
 * @param {Array} issues - Array of GitHub issue objects
 * @returns {Array} Deduplicated array of issues
 */
function deduplicateVotes(issues) {
  if (!Array.isArray(issues) || issues.length === 0) {
    return [];
  }

  // Extract doc path from issue body
  const getDocPath = (issue) => {
    const match = issue.body?.match(/Doc:\s*(.+)/);
    return match ? match[1].trim() : null;
  };

  // Group by doc + username
  const voteMap = new Map();

  for (const issue of issues) {
    const docPath = getDocPath(issue);
    const username = issue.user?.login;

    if (!docPath || !username) {
      continue; // Skip malformed issues
    }

    const key = `${docPath}::${username}`;
    const timestamp = new Date(issue.created_at);

    if (!voteMap.has(key)) {
      voteMap.set(key, issue);
    } else {
      // Keep the most recent vote
      const existing = voteMap.get(key);
      const existingTimestamp = new Date(existing.created_at);

      if (timestamp > existingTimestamp) {
        voteMap.set(key, issue);
      }
    }
  }

  return Array.from(voteMap.values());
}

module.exports = { deduplicateVotes };
