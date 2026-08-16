import { Given, When, Then } from '@cucumber/cucumber';

Given('I open the navigation drawer', async function () {
    await this.navigationDrawerPage.open();
});

When('I close the navigation drawer', async function () {
    await this.navigationDrawerPage.close();
});

When('I click logout', async function () {
    await this.navigationDrawerPage.logout();
});

Then(
    'the navigation drawer should show the following menu items in order:',
    async function (table) {
        await this.navigationDrawerPage.assertMenuItems(table.raw().map(([label]) => label));
    },
);

Then('the navigation drawer should be hidden', async function () {
    await this.navigationDrawerPage.assertHidden();
});

Then('I should remain on the inventory page', async function () {
    await this.inventoryPage.assertLoaded();
});
