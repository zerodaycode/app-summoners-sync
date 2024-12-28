import { ciLocalRun, getRepoOwner } from "./helpers.js";

/**
 * Generates a new comment on the PR that triggered the workflow with the
 * report of the tests runned by 'JEST' over the actions scripts
 */
export default async (github, context, steps) => {
    const isLocalRun = ciLocalRun(context);
    console.log('CTX: ${JSON.stringify(context, null, 2)}');
    const marker = 'to show where the warning was created)';
    const output = steps.run_tests.outputs.tests_report;
    const sanitized = output.split(marker);
    const msg = (sanitized.length > 1) ? sanitized[1] : sanitized[0];

    const prNumber = context.payload.issue.number;

    if (!isLocalRun && sanitized.length >= 1) {
        github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: prNumber,
            body: msg,
        });
    } else {
        if (!isLocalRun)
            core.setFailed('No tests report data available.');
        else
            console.log(`PR message: ${msg}`);
    }
};