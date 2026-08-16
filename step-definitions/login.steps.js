import { Given, When, Then } from '@cucumber/cucumber';

Given('I am on the login page', async function () {
    await this.loginPage.open();
});

When('I click the login button', async function () {
    await this.loginPage.submit();
});

When('I log in with username {string} and password {string}', async function (username, password) {
    await this.loginPage.login(username, password);
});

When('I log in with valid credentials', async function () {
    await this.loginPage.loginAs('standard');
});

/** @param {string} role a key in fixtures/users.json, e.g. "lockedOut" */
When('I log in as the {string} user', async function (role) {
    await this.loginPage.loginAs(role);
});

Then('I should still be on the login page', async function () {
    await this.loginPage.assertStillOnLoginPage();
});

Then('I should be redirected to the inventory page', async function () {
    await this.inventoryPage.assertLoaded();
});
