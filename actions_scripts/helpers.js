// Contains helper functions made to be reusable across the JS scripts
// of the notifications

// Helper function to determine if the workflow is running locally.
/**
 * Check if the current run is a local run (e.g., with ACT).
 * @param {Object} context - GitHub Actions context object.
 * @returns {boolean} - True if running locally, false otherwise.
 */
export function ciLocalRun(context) {
    const localRun = context.payload.act;
    return (localRun !== undefined) ? localRun : false;
}

// Helper function to retrieve the username of the actor triggering the workflow.
/**
 * Get the username of the actor from the context.
 * @param {Object} context - GitHub Actions context object.
 * @returns {string} - The username of the actor.
 * @throws {Error} - if the parsed actor text is non valid
 */
export function extractUsername(context) {
    const actor = context.actor;
    if (actor !== undefined && actor !== "")
        return actor; 
    else
        throw new Error("Unable to determine the actor (user) that triggered this deploy. Leaving...");
}

// Helper function to retrieve the owner of the repository in which the action has been triggered.
/**
 * Get the username of the actor from the context.
 * @param {Object} context - GitHub Actions context object.
 * @returns {string} - The owner of the repository.
 */
export function getRepoOwner(context) {
    const owner = context.payload.organization.login;
    if (owner !== undefined && owner !== "")
        return owner; 
    else
        throw new Error("Unable to parse the owner name of the repository. Leaving...");
}