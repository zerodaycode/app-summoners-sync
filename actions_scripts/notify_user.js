module.exports = async ({github, context, environment, project, infra}) => {
  const isLocalRun = ciLocalRun(context);

  const username = getUsername(context);
  const prNumber = context.payload.issue.number;
  const message = generatePrCommentMsg(username, environment, project, infra);

  if (isLocalRun) {
    logMessageOnLocalEnv(message);
    return { comment_id: 10, message: message } // arbitraty mocked comment number;
  } else {
    try {
      const comment = createPrComment(github, context, prNumber, message);
      return { comment_id: comment.data.id, message: message };
    } catch (ex) {
      console.log("Failed to POST the comment on the PR to notify the user due to =[> " +  ex + "]");
      return { comment_id: null };
    }
  }
}

function ciLocalRun(context) {
  const localRun = context.payload.act;
  return(localRun !== undefined) ? localRun : false;
}

function getUsername(context) {
  const actor = context.actor;
  return (actor !== undefined && actor !== "") ? actor : 'Unknown';
  // TODO: throw ex when undefined or non valid actor
}

function generatePrCommentMsg(username, environment, project, infra) {
  let message = `🚀 Deployment action request received from user: ${username}\n`;
  if (project) {
    message += `- Project: \`${project}\`\n`;
  }
  if (environment) {
    message += `- Environment: \`${environment}\`\n`;
  }
  if (infra) {
    message += `- Infrastructure: \`${infra}\`\n`;
  }

  return message;
}

async function createPrComment(github, context, prNumber, message) {
  return await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    body: message,
  });
}

function logMessageOnLocalEnv(message) {
  console.log(`Action is being runned locally by 'ACT'. 
    Skipping the REST request to post a message for notify the user on PR, but output would have been:
    ${message}`);
}