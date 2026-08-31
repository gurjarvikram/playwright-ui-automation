import { AfterAll, Before, BeforeAll, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import env from '../config/env.js';
import logger from '../support/logger.js';
import { writeAllureMetadata } from '../support/allure-metadata.js';

const BROWSERS = { chromium, firefox, webkit };

// Applies to every step. Above Playwright's own assertion timeout on purpose, so a locator
// that never settles fails as a Playwright error naming it rather than as Cucumber's
// locator-less "function timed out". See `timeouts` in config/env.js.
setDefaultTimeout(env.timeouts.step);

/**
 * One browser per worker process, reused across that worker's scenarios, with a fresh
 * BrowserContext per scenario. Launching a browser costs roughly a second; creating a
 * context costs milliseconds and still guarantees clean cookies, storage and session.
 */
let browser;

// The lifecycle hooks get their own, larger budget: launching an engine, opening a context
// with video recording, and writing a trace zip out are all browser work, not step work.
BeforeAll({ timeout: env.timeouts.hook }, async function () {
    writeAllureMetadata();

    logger.info('Starting suite', {
        environment: env.environment,
        baseUrl: env.baseUrl,
        browser: env.browser,
        headless: env.headless,
    });

    if (env.baseUrlIsOverridden) {
        logger.warn('Base URL overridden by SAUCE_BASE_URL', { baseUrl: env.baseUrl });
    }

    browser = await BROWSERS[env.browser].launch({ headless: env.headless });
});

Before({ timeout: env.timeouts.hook }, async function ({ pickle }) {
    const contextOptions = { viewport: env.viewport };

    if (env.video !== 'off') {
        // Playwright decides recording at context-creation time — there is no way to start a
        // video after a step has already failed. So record whenever retention is not "off"
        // and throw the file away in the After hook if the scenario passed.
        contextOptions.recordVideo = { dir: env.artifactsDir };
    }

    this.context = await browser.newContext(contextOptions);

    if (env.trace !== 'off') {
        await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    }

    this.initPageObjects(await this.context.newPage());
    this.newCustomer();

    logger.debug('Scenario started', { scenario: pickle.name });
});

After({ timeout: env.timeouts.hook }, async function ({ pickle, result }) {
    const failed = result?.status === Status.FAILED;
    const keep = failed || env.trace === 'on' || env.video === 'on';
    const slug = artefactSlug(pickle.name);

    if (keep) mkdirSync(env.artifactsDir, { recursive: true });

    // Screenshot first: it is the one artefact small enough to live inside the report itself,
    // so a reviewer sees the failure without downloading anything.
    if (failed && this.page) {
        try {
            await this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
        } catch (error) {
            // A crashed page cannot be screenshotted. That must not mask the real failure.
            logger.warn('Could not capture failure screenshot', { reason: error.message });
        }
    }

    if (env.trace !== 'off') {
        const shouldKeepTrace = failed || env.trace === 'on';
        await this.context.tracing.stop(
            shouldKeepTrace ? { path: join(env.artifactsDir, `${slug}.trace.zip`) } : {},
        );
        if (shouldKeepTrace) {
            logger.info('Trace saved', { path: join(env.artifactsDir, `${slug}.trace.zip`) });
        }
    }

    // Grab the handle before closing: the video is only finalised on context close, and the
    // page is gone by then.
    const video = this.page?.video();

    await this.context?.close();

    if (video) {
        const shouldKeepVideo = failed || env.video === 'on';
        if (shouldKeepVideo) {
            // Playwright names the file after a random hash. Saving it under the scenario
            // slug is what lets a reviewer pair a video with its trace in the artefact
            // bundle without cross-referencing the run log.
            const videoPath = join(env.artifactsDir, `${slug}.webm`);
            await video.saveAs(videoPath);
            logger.info('Video saved', { path: videoPath });
        }

        // Removes the hash-named original in both cases: saveAs copies rather than moves.
        await video.delete();
    }
});

AfterAll({ timeout: env.timeouts.hook }, async function () {
    await browser?.close();
});

/** Filesystem-safe, collision-free name for this scenario's artefacts. */
function artefactSlug(scenarioName) {
    const base = scenarioName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);

    // Scenario names are not unique (Scenario Outline reuses one name for every example) and
    // workers run concurrently, so the worker id and a timestamp keep the files apart.
    return `${base}-w${process.env.CUCUMBER_WORKER_ID ?? '0'}-${Date.now()}`;
}
