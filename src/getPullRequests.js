require("dotenv").config();

const { githubRequest } = require("./githubApi");

async function getPullRequests() {
  try {
    const pulls = await githubRequest(
      "/repos/Neha6383/repository-api-rnd/pulls?state=all&per_page=100"
    );

    console.log(`✅ Retrieved ${pulls.length} pull requests`);

    for (const pr of pulls) {
      console.log({
        number: pr.number,
        title: pr.title,
        author: pr.user?.login || "Unknown",
        state: pr.state,
        createdAt: pr.created_at,
        closedAt: pr.closed_at,
        mergedAt: pr.merged_at,
      });
    }
  } catch (error) {
    console.error("❌ Failed to retrieve pull requests");
    console.error(error.message);
  }
}

getPullRequests();