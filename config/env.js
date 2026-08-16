import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import resolveEnvironment from './resolve-environment.js';

const here = dirname(fileURLToPath(import.meta.url));
const users = JSON.parse(readFileSync(join(here, '..', 'fixtures', 'users.json'), 'utf8'));

const SUPPORTED_BROWSERS = ['chromium', 'firefox', 'webkit'];
const RETENTION_MODES = ['off', 'retain-on-failure', 'on'];

function oneOf(name, allowed, fallback) {
    const value = process.env[name]?.trim() || fallback;

    if (!allowed.includes(value)) {
        throw new Error(`Unknown ${name} "${value}". Supported: ${allowed.join(', ')}.`);
    }

    return value;
}

const browser = oneOf('BROWSER', SUPPORTED_BROWSERS, 'chromium');
const environment = resolveEnvironment();

const isCI = Boolean(process.env.CI);

export default {
    environment: environment.name,
    baseUrl: environment.baseUrl,
    baseUrlIsOverridden: environment.isOverridden,
    browser,
    headless: process.env.HEADLESS !== 'false',
    isCI,

    // 1440x900 keeps every run on the desktop layout. Left to the browser default, a CI
    // container and a laptop can render different breakpoints and disagree about a failure.
    viewport: { width: 1440, height: 900 },

    /**
     * Failure artefacts.
     *
     * A trace is cheap to record and is the difference between "it failed in CI" and a
     * step-by-step replay with DOM snapshots, so it defaults on everywhere. Video is far
     * more expensive, so it defaults on only in CI, where nobody can watch the run happen.
     */
    trace: oneOf('TRACE', RETENTION_MODES, 'retain-on-failure'),
    video: oneOf('VIDEO', RETENTION_MODES, isCI ? 'retain-on-failure' : 'off'),
    artifactsDir: process.env.ARTIFACTS_DIR?.trim() || 'artifacts',

    /**
     * Credentials for a named account from fixtures/users.json.
     *
     * SAUCE_USERNAME / SAUCE_PASSWORD override the standard user only. Scenarios that name a
     * specific account (locked out, problem, ...) are about that account's behaviour, so an
     * env override there would quietly turn the test into something else.
     */
    user(role = 'standard') {
        if (!Object.hasOwn(users, role)) {
            const known = Object.keys(users).join(', ');
            throw new Error(`Unknown user role "${role}". Known roles: ${known}.`);
        }

        const user = users[role];

        if (role === 'standard') {
            return {
                username: process.env.SAUCE_USERNAME?.trim() || user.username,
                password: process.env.SAUCE_PASSWORD?.trim() || user.password,
            };
        }

        return { username: user.username, password: user.password };
    },
};
