require("dotenv").config();

const { githubRequest } = require("./githubApi");

const OWNER = "Neha6383";
const REPO = "repository-api-rnd";
const PR_NUMBER = 1;

async function getPRDetails() {
  try {
    const reviews = await githubRequest(
      `/repos/${OWNER}/${REPO}/pulls/${PR_NUMBER}/reviews?per_page=100`
    );

    const comments = await githubRequest(
      `/repos/${OWNER}/${REPO}/issues/${PR_NUMBER}/comments?per_page=100`
    );

    console.log("PR details retrieved successfully");

    console.log("Total reviews:", reviews.length);
    console.log("Total comments:", comments.length);

    console.log("\nReviews:");

    for (const review of reviews) {
      console.log({
        reviewer: review.user?.login || "Unknown",
        state: review.state,
        submittedAt: review.submitted_at,
      });
    }

    console.log("\nComments:");

    for (const comment of comments) {
      console.log({
        author: comment.user?.login || "Unknown",
        createdAt: comment.created_at,
      });
    }
  } catch (error) {
    console.error("Failed to retrieve PR details");
    console.error(error.message);
  }
}

getPRDetails();