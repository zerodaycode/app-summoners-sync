module.exports = async ({github, context, environment, project, infra}) => {
    const localRun = context.payload.act;
    const isLocalRun = (localRun !== undefined) ? localRun : false;

    const actor = context.actor;
    const username = (actor !== undefined && actor !== "") ? actor : 'Unknown';

    const prNumber = context.payload.issue.number;

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

    if (isLocalRun) {
      console.log(`Action is being runned locally by 'ACT'. 
      Skipping the REST request to post a message for notify the user on PR, but output would have been:
      ${message}`);
      return { comment_id: 10, message: message } // arbitraty mocked comment number;
    } else {
      let comment = {};
      try {
        comment = await github.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: prNumber,
          body: message,
        });
        return { comment_id: comment.data.id, message: message };
      } catch (ex) {
        console.log("Failed to POST the comment on the PR to notify the user due to =[> " +  ex + "]");
        return { comment_id: null };
      }
    }
}