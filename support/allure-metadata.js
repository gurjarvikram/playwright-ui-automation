import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { platform, release } from 'node:os';
import env from '../config/env.js';

const RESULTS_DIR = 'allure-results';

/**
 * Allure reads three optional files out of the results directory. None of them are produced
 * by the Cucumber reporter, so a report generated without them loses the context that makes
 * a failed run diagnosable weeks later: what it ran against, and who ran it.
 *
 * Writes are idempotent — every parallel worker calls this, and they all write the same
 * content, so last-writer-wins is harmless.
 */
export function writeAllureMetadata() {
    mkdirSync(RESULTS_DIR, { recursive: true });

    writeEnvironmentProperties();
    writeCategories();
    writeExecutor();
}

/** Shown in the report's "Environment" widget. */
function writeEnvironmentProperties() {
    const properties = {
        Environment: env.environment,
        'Base.URL': env.baseUrl,
        'Base.URL.Overridden': env.baseUrlIsOverridden,
        Browser: env.browser,
        Headless: env.headless,
        Node: process.version,
        OS: `${platform()} ${release()}`,
        CI: Boolean(process.env.CI),
    };

    const body = Object.entries(properties)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    writeFileSync(join(RESULTS_DIR, 'environment.properties'), `${body}\n`, 'utf8');
}

/**
 * Sorts failures into buckets on the report's "Categories" tab.
 *
 * The distinction that matters on a real project is product defect versus test defect: a
 * failed assertion is a finding, whereas a timeout or a selector that matched nothing is
 * usually the suite's own problem and should not be filed against the application.
 */
function writeCategories() {
    const categories = [
        {
            name: 'Product defect',
            matchedStatuses: ['failed'],
            messageRegex: '.*(expect|Expected).*',
        },
        {
            name: 'Broken selector',
            matchedStatuses: ['broken', 'failed'],
            messageRegex: '.*(strict mode violation|resolved to 0 elements|no element).*',
        },
        {
            name: 'Timeout',
            matchedStatuses: ['broken', 'failed'],
            messageRegex: '.*(Timeout|timed out|exceeded).*',
        },
        {
            name: 'Environment problem',
            matchedStatuses: ['broken'],
            messageRegex: '.*(ERR_CONNECTION|ENOTFOUND|ECONNREFUSED|net::).*',
        },
        {
            name: 'Test defect',
            matchedStatuses: ['broken'],
        },
    ];

    writeFileSync(
        join(RESULTS_DIR, 'categories.json'),
        `${JSON.stringify(categories, null, 2)}\n`,
        'utf8',
    );
}

/**
 * Links each report back to the CI run that produced it. Written only in CI, where the
 * GitHub Actions variables that identify the run are present.
 */
function writeExecutor() {
    const {
        GITHUB_ACTIONS,
        GITHUB_SERVER_URL,
        GITHUB_REPOSITORY,
        GITHUB_RUN_ID,
        GITHUB_RUN_NUMBER,
    } = process.env;

    if (!GITHUB_ACTIONS || !GITHUB_REPOSITORY || !GITHUB_RUN_ID) return;

    const runUrl = `${GITHUB_SERVER_URL ?? 'https://github.com'}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;

    writeFileSync(
        join(RESULTS_DIR, 'executor.json'),
        `${JSON.stringify(
            {
                name: 'GitHub Actions',
                type: 'github',
                reportName: `${env.browser} on ${env.environment}`,
                url: runUrl,
                buildUrl: runUrl,
                buildOrder: Number(GITHUB_RUN_NUMBER ?? 0),
                buildName: `#${GITHUB_RUN_NUMBER ?? '0'} (${env.browser})`,
            },
            null,
            2,
        )}\n`,
        'utf8',
    );
}

export default writeAllureMetadata;
