import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// Read rather than `import ... with { type: 'json' }`: import attributes only became stable in
// Node 22, and this framework supports Node 20.
const users = JSON.parse(readFileSync(join(here, 'users.json'), 'utf8'));

/** The one account whose credentials may be swapped out per environment. */
const OVERRIDABLE_ROLE = 'standard';

// Validated at import time, which means `npm run verify` catches a malformed entry in about a
// second, without launching a browser. Left unchecked, a missing password reaches the login
// form as `undefined` and the run fails with a validation error from the application — a
// failure that reads like a product defect and is not one.
for (const [role, account] of Object.entries(users)) {
    if (!account?.username || !account?.password) {
        throw new Error(
            `test-data/users.json: role "${role}" must define both a username and a password.`,
        );
    }
}

/**
 * Credentials for a named account.
 *
 * SAUCE_USERNAME / SAUCE_PASSWORD override the standard user only. Scenarios that name a
 * specific account (locked out, problem, ...) are about that account's behaviour, so an
 * environment override there would quietly turn the test into something else.
 *
 * The overrides are read here rather than in `config/env.js` because they are data: what the
 * suite types into the form, not how the run is configured.
 *
 * @param {string} [role] a key in test-data/users.json
 * @returns {{ username: string, password: string }}
 */
export function getUser(role = OVERRIDABLE_ROLE) {
    if (!Object.hasOwn(users, role)) {
        const known = Object.keys(users).join(', ');
        throw new Error(`Unknown user role "${role}". Known roles: ${known}.`);
    }

    const account = users[role];

    if (role === OVERRIDABLE_ROLE) {
        return Object.freeze({
            username: process.env.SAUCE_USERNAME?.trim() || account.username,
            password: process.env.SAUCE_PASSWORD?.trim() || account.password,
        });
    }

    return Object.freeze({ username: account.username, password: account.password });
}
