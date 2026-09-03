function getRepositoryInfo() {
  return {
    name: "repository-api-rnd",
    purpose: "GitHub REST API proof of concept",
    technology: "Node.js",
  };
}

function calculateCommitSummary(commits) {
  const summary = {};

  for (const commit of commits) {
    const author = commit.author || "Unknown";
    summary[author] = (summary[author] || 0) + 1;
  }

  return summary;
}

module.exports = {
  getRepositoryInfo,
  calculateCommitSummary,
};
