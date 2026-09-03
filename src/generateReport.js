require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { githubRequest } = require("./githubApi");

const OWNER = "Neha6383";
const REPO = "repository-api-rnd";

async function getAllPages(endpointBuilder) {
  const results = [];
  let page = 1;

  while (true) {
    const data = await githubRequest(endpointBuilder(page));

    results.push(...data);

    if (data.length < 100) {
      break;
    }

    page++;
  }

  return results;
}

function getLast30DaysDate() {
  return new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );
}

function calculateAverageMergeTime(pullRequests) {
  const mergedPRs = pullRequests.filter(
    (pr) => pr.merged_at
  );

  if (mergedPRs.length === 0) {
    return null;
  }

  const totalMilliseconds = mergedPRs.reduce(
    (total, pr) => {
      const created = new Date(pr.created_at);
      const merged = new Date(pr.merged_at);

      return total + (merged - created);
    },
    0
  );

  return Math.round(
    totalMilliseconds / mergedPRs.length / 1000
  );
}

async function main() {
  try {
    const since = getLast30DaysDate();

    // 1. Get commits
    const commits = await getAllPages((page) => {
      return (
        `/repos/${OWNER}/${REPO}/commits` +
        `?since=${encodeURIComponent(since.toISOString())}` +
        `&per_page=100&page=${page}`
      );
    });

    // 2. Count commits per author
    const commitsPerAuthor = {};

    for (const commit of commits) {
      const author =
        commit.author?.login ||
        commit.commit.author?.name ||
        "Unknown";

      commitsPerAuthor[author] =
        (commitsPerAuthor[author] || 0) + 1;
    }

    // 3. Get pull requests
    const allPullRequests = await getAllPages((page) => {
      return (
        `/repos/${OWNER}/${REPO}/pulls` +
        `?state=all&per_page=100&page=${page}`
      );
    });

    // Only PRs created during the last 30 days
    const pullRequests = allPullRequests.filter(
      (pr) => new Date(pr.created_at) >= since
    );

    // 4. Get reviews and comments for every PR
    const prDetails = [];

    for (const pr of pullRequests) {
      const reviews = await getAllPages((page) => {
        return (
          `/repos/${OWNER}/${REPO}/pulls/${pr.number}/reviews` +
          `?per_page=100&page=${page}`
        );
      });

      const comments = await getAllPages((page) => {
        return (
          `/repos/${OWNER}/${REPO}/issues/${pr.number}/comments` +
          `?per_page=100&page=${page}`
        );
      });

      prDetails.push({
        number: pr.number,
        title: pr.title,
        author: pr.user?.login || "Unknown",
        state: pr.state,
        createdAt: pr.created_at,
        closedAt: pr.closed_at,
        mergedAt: pr.merged_at,
        reviewCount: reviews.length,
        commentCount: comments.length,
        reviews: reviews.map((review) => ({
          reviewer: review.user?.login || "Unknown",
          state: review.state,
          submittedAt: review.submitted_at,
        })),
      });
    }

    // 5. Calculate statistics
    const mergedPRs = pullRequests.filter(
      (pr) => pr.merged_at
    );

    const averageMergeTimeSeconds =
      calculateAverageMergeTime(pullRequests);

    const report = {
      repository: `${OWNER}/${REPO}`,
      period: {
        from: since.toISOString(),
        to: new Date().toISOString(),
      },

      statistics: {
        totalCommits: commits.length,
        commitsPerAuthor,
        totalPullRequests: pullRequests.length,
        mergedPullRequests: mergedPRs.length,
        averagePRCreationToMergeSeconds:
          averageMergeTimeSeconds,
      },

      pullRequests: prDetails,
    };

    // 6. Create reports folder
    const reportsDirectory = path.join(
      __dirname,
      "..",
      "reports"
    );

    fs.mkdirSync(reportsDirectory, {
      recursive: true,
    });

    // 7. Write JSON report
    const jsonPath = path.join(
      reportsDirectory,
      "repository-summary.json"
    );

    fs.writeFileSync(
      jsonPath,
      JSON.stringify(report, null, 2)
    );

    // 8. Write CSV summary
    const csvRows = [
      [
        "PR Number",
        "Title",
        "Author",
        "State",
        "Created At",
        "Closed At",
        "Merged At",
        "Review Count",
        "Comment Count",
      ],
    ];

    for (const pr of prDetails) {
      csvRows.push([
        pr.number,
        `"${pr.title.replace(/"/g, '""')}"`,
        pr.author,
        pr.state,
        pr.createdAt,
        pr.closedAt || "",
        pr.mergedAt || "",
        pr.reviewCount,
        pr.commentCount,
      ]);
    }

    const csvContent = csvRows
      .map((row) => row.join(","))
      .join("\n");

    const csvPath = path.join(
      reportsDirectory,
      "pull-requests.csv"
    );

    fs.writeFileSync(csvPath, csvContent);

    console.log("\n================================");
    console.log("Repository API Report Generated");
    console.log("================================");

    console.log("Repository:", report.repository);
    console.log("Total commits:", commits.length);
    console.log(
      "Total pull requests:",
      pullRequests.length
    );
    console.log(
      "Merged pull requests:",
      mergedPRs.length
    );

    if (averageMergeTimeSeconds !== null) {
      console.log(
        "Average PR creation → merge:",
        averageMergeTimeSeconds,
        "seconds"
      );
    }

    console.log("\nCommits per author:");
    console.log(commitsPerAuthor);

    console.log("\nReports created:");
    console.log(jsonPath);
    console.log(csvPath);
  } catch (error) {
    console.error("Failed to generate repository report");
    console.error(error.message);
  }
}

main();