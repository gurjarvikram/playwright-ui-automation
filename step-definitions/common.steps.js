import { Given, Then } from '@cucumber/cucumber';
import { getUser } from '../test-data/index.js';

/**
 * Steps used by more than one feature.
 *
 * Cucumber loads every step definition file for every feature, so step text must be globally
 * unique. Anything shared lives here; defining it twice fails the run immediately, which is
 * the intended safety net rather than a nuisance.
 */

Given('I am logged in as a standard user', async function () {
    const { username, password } = getUser('standard');

    await this.loginPage.open();
    await this.loginPage.login(username, password);
    await this.inventoryPage.assertLoaded();
});

// The error banner is shared chrome: the same element serves the login form and both
// checkout validation steps, so the assertion goes through commonPage rather than pretending
// the banner belongs to one particular page.
Then('I should see the error message {string}', async function (message) {
    await this.commonPage.assertErrorMessage(message);
});
