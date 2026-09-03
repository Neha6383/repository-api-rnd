require("dotenv").config();

const { githubRequest } = require("./githubApi");

async function getAllCommits() {
  const since = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const allCommits = [];
  let page = 1;

  while (true) {
    const endpoint =
      `/repos/Neha6383/repository-api-rnd/commits` +
      `?since=${encodeURIComponent(since)}` +
      `&per_page=100&page=${page}`;

    const commits = await githubRequest(endpoint);

    allCommits.push(...commits);

    console.log(`Page ${page}: ${commits.length} commits`);

    if (commits.length < 100) {
      break;
    }

    page++;
  }

  return {
    since,
    commits: allCommits,
  };
}

async function main() {
  try {
    const result = await getAllCommits();

    console.log("\n✅ All commits retrieved");
    console.log("Period:", result.since, "to now");
    console.log("Total commits:", result.commits.length);

    for (const commit of result.commits) {
      console.log({
        sha: commit.sha,
        message: commit.commit.message.split("\n")[0],
        author:
          commit.author?.login ||
          commit.commit.author?.name ||
          "Unknown",
        date: commit.commit.author?.date,
      });
    }
  } catch (error) {
    console.error("❌ Failed to retrieve commits");
    console.error(error.message);
  }
}

main();