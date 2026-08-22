import 'dotenv/config';
import resolveEnvironment from './resolve-environment.js';

/**
 * How a run is configured: which site, which engine, and what to keep when a scenario fails.
 *
 * Deliberately holds no test data. What the suite types into the application lives in
 * `test-data/`, reached through its barrel. Keeping the two apart is what stops this file
 * growing into the junk drawer every framework eventually acquires.
 */

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
};
