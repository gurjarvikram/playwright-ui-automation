import { faker } from '@faker-js/faker';

/**
 * Generated checkout data.
 *
 * A builder rather than a constant: the checkout form is one of the few places the suite
 * *writes* data, and a fixed name proves nothing that a generated one does not, while a fixed
 * one hides an application that quietly depends on a particular value.
 *
 * Nothing is generated at module scope. A module is evaluated once per worker process, so
 * module-level data would be shared by every scenario that worker runs — the classic way a
 * parallel suite starts failing in ways it cannot reproduce serially.
 */

const seed = process.env.FAKER_SEED?.trim();

if (seed) {
    if (!/^\d+$/.test(seed)) {
        throw new Error(`FAKER_SEED must be a whole number, got "${seed}".`);
    }

    // Makes a run's generated data repeatable, so a failure that depended on a particular
    // postal code can be reproduced. Each worker seeds its own copy of faker, so pair this
    // with CUCUMBER_WORKERS=0 for a byte-identical rerun.
    faker.seed(Number(seed));
}

/**
 * @param {Partial<{ firstName: string, lastName: string, postalCode: string }>} [overrides]
 *   Pin individual fields — for a scenario about a specific value, e.g. a postal code format.
 * @returns {{ firstName: string, lastName: string, postalCode: string }}
 */
export function buildCustomer(overrides = {}) {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        postalCode: faker.location.zipCode(),
        ...overrides,
    };
}
