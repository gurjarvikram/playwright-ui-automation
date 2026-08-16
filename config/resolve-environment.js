import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// Read rather than `import ... with { type: 'json' }`: import attributes only became stable in
// Node 22, and this framework supports Node 20.
const environments = JSON.parse(readFileSync(join(here, 'environments.json'), 'utf8'));

const DEFAULT_ENVIRONMENT = 'production';

/**
 * Decides which site the suite runs against.
 *
 * Resolution order: SAUCE_BASE_URL (ad-hoc override) -> the TEST_ENV entry -> production.
 *
 * An unrecognised TEST_ENV throws instead of falling back. A silent fallback is the worse
 * failure by far: the whole suite would run against the wrong site and still report green.
 */
export default function resolveEnvironment() {
    const name = process.env.TEST_ENV?.trim() || DEFAULT_ENVIRONMENT;
    const override = process.env.SAUCE_BASE_URL?.trim();

    if (!Object.hasOwn(environments, name)) {
        const known = Object.keys(environments).join(', ');
        throw new Error(
            `Unknown TEST_ENV "${name}". Known environments: ${known}. ` +
                'Add it to config/environments.json, or use SAUCE_BASE_URL for a one-off run.',
        );
    }

    return {
        name,
        baseUrl: override || environments[name].baseUrl,
        isOverridden: Boolean(override),
    };
}
