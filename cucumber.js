// This config is evaluated before any support code, so dotenv must load here too
// or CUCUMBER_* values set in .env are silently ignored.
import 'dotenv/config';

const isCI = !!process.env.CI;

export default {
    paths: ['features/**/*.feature'],
    import: ['step-definitions/**/*.js', 'support/**/*.js'],

    // Each worker is its own process, so hooks.js launches one browser per worker.
    parallel: Number(process.env.CUCUMBER_WORKERS || (isCI ? 4 : 0)),

    tags: process.env.CUCUMBER_TAGS || '',

    // Undefined, pending or ambiguous steps fail the run instead of being reported as a
    // passing suite with gaps in it. A skipped step nobody noticed is worse than a red build.
    strict: true,

    /**
     * One retry in CI only.
     *
     * A shared runner competing for CPU produces genuine infrastructure flake, and a retry
     * keeps that from blocking a merge. Cucumber still reports a scenario that only passed on
     * retry as flaky, so the noise stays visible rather than being swept up. Locally the
     * retry count is zero: a test that fails on your machine should stay failed while you
     * look at it.
     */
    retry: isCI ? 1 : 0,

    format: [
        // progress-bar redraws in place, which is unreadable in Actions logs.
        isCI ? 'progress' : 'progress-bar',
        // Cucumber allows only one formatter per output stream and silently drops
        // the losers. Without this explicit sidecar the allure reporter claims
        // stdout, killing all console output (or gets dropped and writes nothing).
        'allure-cucumberjs/reporter:allure.log',
        'summary:cucumber-summary.txt',
    ],
    formatOptions: {
        resultsDir: 'allure-results',
    },
};
