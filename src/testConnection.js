require("dotenv").config();

const { githubRequest } = require("./githubApi");

async function testConnection() {
  try {
    const repo = await githubRequest(
      "/repos/Neha6383/repository-api-rnd"
    );

    console.log("✅ Connected to GitHub API");
    console.log("Repository:", repo.full_name);
    console.log("Private:", repo.private);
  } catch (error) {
    console.error("❌ API connection failed");
    console.error(error.message);
  }
}

testConnection();