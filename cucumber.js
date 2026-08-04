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
    format: [
        // progress-bar redraws in place, which is unreadable in Actions logs.
        isCI ? 'progress' : 'progress-bar',
        // Cucumber allows only one formatter per output stream and silently drops
        // the losers. Without this explicit sidecar the allure reporter claims
        // stdout, killing all console output (or gets dropped and writes nothing).
        'allure-cucumberjs/reporter:allure.log',
    ],
    formatOptions: {
        resultsDir: 'allure-results',
    },
};
