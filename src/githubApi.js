const GITHUB_API_URL = "https://api.github.com";

async function githubRequest(endpoint) {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

module.exports = {
  githubRequest,
};