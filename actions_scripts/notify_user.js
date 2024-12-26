module.exports = async ({github, context, steps}) => {
    console.log(`GITHUB: ${JSON.stringify(github, null, 2)}`);
    console.log(`CTX: ${JSON.stringify(context, null, 2)}`);
    console.log(`process: ${JSON.stringify(process.env, null, 2)}`);
    const {SHA} = process.env
    console.log(`SHA: ${SHA}`)
    // console.log(`STEPS: ${JSON.stringify(steps, null, 2)}`);

    const environment = steps.parse_command.outputs.environment;
    const project = steps.parse_command.outputs.project;
    const infra = steps.parse_command.outputs.infra;

    const actor = github.event.comment.user.login;
    console.log(`Actor: ${actor}`)
    const username = (actor !== "") ? actor : 'Unknown';

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

    if (`${ github.event.act }` === 'true') {
      console.log(`Action is being runned locally by 'ACT'. 
      Skipping the notify user on PR, but output would have been:
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
        return { "comment_id": null };
      }
    }
}