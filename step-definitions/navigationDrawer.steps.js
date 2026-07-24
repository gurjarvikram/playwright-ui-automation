import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am logged in as a standard user', async function () {
    await this.loginPage.gotoLoginPage();
    await this.loginPage.loginAsStandardUser();
});

Given('I open the navigation drawer', async function () {
    await this.navigationDrawerPage.openDrawer();
});

Then('the navigation drawer should show the following menu items in order:', async function (dataTable) {
    const expected = dataTable.raw().map((row) => row[0]);
    const actual = await this.navigationDrawerPage.getMenuItemTexts();
    expect(actual).toEqual(expected);
});

When('I click logout', async function () {
    await this.navigationDrawerPage.logout();
});

Then('the navigation drawer should be hidden', async function () {
    await expect(this.page.locator(this.navigationDrawerPage.drawerItemMenu)).toBeHidden();
});

When('I close the navigation drawer', async function () {
    await this.navigationDrawerPage.closeDrawer();
});

Then('I should remain on the inventory page', async function () {
    await expect(this.page).toHaveURL(/inventory\.html$/);
});
