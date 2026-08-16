#!/usr/bin/env node
/**
 * Thin wrapper around cucumber-js.
 *
 * Cucumber has no native --browser or --headed flag the way the Cypress CLI does, so those
 * choices travel as environment variables. Setting them inline (`BROWSER=firefox cucumber-js`)
 * is a POSIX shell feature that cmd.exe does not understand, and pulling in `cross-env` just
 * to paper over that is a dependency for one line of code. Spawning the runner from Node sets
 * the variables the same way on every platform, with nothing extra installed.
 *
 * Usage:
 *   node scripts/run-suite.js --browser firefox --headed --tags "@smoke" -- --dry-run
 *
 * Anything after a bare `--` is forwarded to cucumber-js untouched.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SUPPORTED_BROWSERS = ['chromium', 'firefox', 'webkit'];

const argv = process.argv.slice(2);
const passthroughAt = argv.indexOf('--');
const ownArgs = passthroughAt === -1 ? argv : argv.slice(0, passthroughAt);
const cucumberArgs = passthroughAt === -1 ? [] : argv.slice(passthroughAt + 1);

const overrides = {};

for (let i = 0; i < ownArgs.length; i += 1) {
    const arg = ownArgs[i];

    switch (arg) {
        case '--browser': {
            const browser = ownArgs[(i += 1)];
            if (!SUPPORTED_BROWSERS.includes(browser)) {
                // Fail here rather than inside a hook: an unknown browser would otherwise
                // surface as a confusing "cannot read property launch of undefined".
                console.error(
                    `Unknown browser "${browser}". Supported: ${SUPPORTED_BROWSERS.join(', ')}.`,
                );
                process.exit(1);
            }
            overrides.BROWSER = browser;
            break;
        }
        case '--headed':
            overrides.HEADLESS = 'false';
            break;
        case '--serial':
            // A headed run that fans out across workers opens one window per worker, which is
            // unwatchable. Debugging is the whole point of --headed, so pin it to one process.
            overrides.CUCUMBER_WORKERS = '0';
            break;
        case '--tags':
            overrides.CUCUMBER_TAGS = ownArgs[(i += 1)] ?? '';
            break;
        default:
            console.error(`Unrecognised option "${arg}".`);
            process.exit(1);
    }
}

// Resolving '@cucumber/cucumber/bin/cucumber.js' directly fails: the package's "exports" map
// does not expose that subpath. The manifest is exported, so read the bin entry from it and
// resolve the path ourselves. Spawning the .js file rather than node_modules/.bin/cucumber-js
// matters on Windows, where that entry is a .cmd shim node cannot execute.
const require = createRequire(import.meta.url);
const manifestPath = require.resolve('@cucumber/cucumber/package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const cucumberBin = resolve(dirname(manifestPath), manifest.bin['cucumber-js']);

const child = spawn(process.execPath, [cucumberBin, ...cucumberArgs], {
    stdio: 'inherit',
    env: { ...process.env, ...overrides },
});

child.on('exit', (code, signal) => {
    // Preserve the runner's own exit code so CI still fails on a red suite.
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }
    process.exit(code ?? 1);
});
