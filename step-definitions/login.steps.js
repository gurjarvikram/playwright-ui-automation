import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the login page', async function () {
    await this.loginPage.gotoLoginPage();
});

When('I click the login button', async function () {
    await this.loginPage.clickLoginButton();
});

When('I log in with username {string} and password {string}', async function (username, password) {
    await this.loginPage.login(username, password);
});

When('I log in with valid credentials', async function () {
    await this.loginPage.loginAsStandardUser();
});

Then('I should still be on the login page', async function () {
    await expect(this.page).toHaveURL(/saucedemo\.com\/?$/);
});

Then('I should see the error message {string}', async function (message) {
    await expect(this.page.locator(this.loginPage.errorMsg)).toContainText(message);
});

Then('I should be redirected to the inventory page', async function () {
    await this.page.locator(this.loginPage.titleInventory).waitFor({ state: 'visible' });
    await expect(this.page).toHaveTitle('Swag Labs');
});
