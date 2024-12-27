import { ciLocalRun, extractUsername } from "./helpers.js";

// Main function to notify the user about deployment actions.
/**
 * Notify the user about the deployment action.
 * @param {Object} options - The options for the notification.
 * @param {Object} options.github - GitHub API client provided by actions/github-script.
 * @param {Object} options.context - Context object from GitHub Actions, containing payload and environment details.
 * @param {string} options.environment - Deployment environment (e.g., pre, prod).
 * @param {string} options.project - Project name associated with the deployment.
 * @param {string} options.infra - Infrastructure type (e.g., postgres, redis).
 * @returns {Object} - An object containing the comment ID and the message content.
 */
export default async ({ github, context, environment, project, infra }) => {
  const isLocalRun = ciLocalRun(context);

  const username = extractUsername(context);
  const prNumber = context.payload.issue.number;
  const message = generatePrCommentMsg(username, environment, project, infra);

  if (isLocalRun) {
    logMessageOnLocalEnv(message);
    // Return a mock comment ID for local testing purposes.
    return { comment_id: 1010101010, message: message };
  } else {
    try {
      const comment = await createPrComment(github, context, prNumber, message);
      return { comment_id: comment.data.id, message: message };
    } catch (ex) {
      console.log("Failed to POST the comment on the PR to notify the user due to =[> " + ex + "]");
      return { comment_id: null };
    }
  }
};

// Helper function to generate the PR comment message.
/**
 * Generate the content of the PR comment to notify the user.
 * @param {string} username - Username of the actor triggering the workflow.
 * @param {string} environment - Deployment environment (e.g., pre, pre-pro, pro).
 * @param {string} project - Project name associated with the deployment.
 * @param {string} infra - Infrastructure entity (e.g., postgres, redis).
 * @returns {string} - The formatted message to be posted on the PR.
 */
function generatePrCommentMsg(username, environment, project, infra) {
  let message = `🚀 Deployment action request received from user: ${username}\n`;
  
  if (project)
    message += `- Project: \`${project}\`\n`;
  if (environment)
    message += `- Environment: \`${environment}\`\n`;
  if (infra)
    message += `- Infrastructure: \`${infra}\`\n`;

  return message;
}

// Helper function to create a PR comment via the GitHub API.
/**
 * Post a comment on the PR to notify the user.
 * @param {Object} github - GitHub API client.
 * @param {Object} context - GitHub Actions context object.
 * @param {number} prNumber - Pull request number.
 * @param {string} message - Message content to be posted.
 * @returns {Object} - The response object from the GitHub API.
 */
async function createPrComment(github, context, prNumber, message) {
  return await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    body: message,
  });
}

// Helper function to log the PR comment message in a local environment.
/**
 * Log the message locally for debugging when running with ACT.
 * @param {string} message - Message content to be logged.
 */
function logMessageOnLocalEnv(message) {
  console.log(`Action is being runned locally by 'ACT'. 
    Skipping the REST request to post a message for notifying the user on PR, but the output would have been:
    ${message}`);
}
