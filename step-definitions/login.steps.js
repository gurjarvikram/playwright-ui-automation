import { Given, When, Then } from '@cucumber/cucumber';
import { getUser } from '../test-data/index.js';

Given('I am on the login page', async function () {
    await this.loginPage.open();
});

When('I click the login button', async function () {
    await this.loginPage.submit();
});

When('I log in with valid credentials', async function () {
    const { username, password } = getUser('standard');
    await this.loginPage.login(username, password);
});

/**
 * Resolving the role here, rather than inside the page object, is what keeps the data layer
 * above the page layer: the step decides *which* account, the page object only knows how to
 * type one in.
 *
 * @param {string} role a key in test-data/users.json, e.g. "lockedOut"
 */
When('I log in as the {string} user', async function (role) {
    const { username, password } = getUser(role);
    await this.loginPage.login(username, password);
});

Then('I should still be on the login page', async function () {
    await this.loginPage.assertStillOnLoginPage();
});

Then('I should be redirected to the inventory page', async function () {
    await this.inventoryPage.assertLoaded();
});
