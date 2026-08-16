import { Given, When, Then } from '@cucumber/cucumber';

Then('the products page should be displayed', async function () {
    await this.inventoryPage.assertLoaded();

    // Capture the default order so the sort assertion can be derived from it rather than
    // from the sorted page itself.
    this.defaultItemOrder = await this.inventoryPage.getItemNames();
});

When('I sort products by {string}', async function (optionLabel) {
    await this.inventoryPage.sortBy(optionLabel);
});

Then('the products should be listed in descending name order', async function () {
    const expected = [...this.defaultItemOrder].sort().reverse();
    await this.inventoryPage.assertItemOrder(expected);
});

When('I add the first product to the cart', async function () {
    await this.inventoryPage.addFirstProductToCart();
});

Given('I have added the first product to the cart', async function () {
    await this.inventoryPage.addFirstProductToCart();
});

Given('I have added {int} products to the cart', async function (count) {
    await this.inventoryPage.addProductsToCart(count);
});

When('I open the cart', async function () {
    await this.inventoryPage.openCart();
});

Then('I should be on the cart page', async function () {
    await this.cartPage.assertLoaded();
});

Then('the cart page should display the standard cart labels', async function () {
    await this.cartPage.assertStandardLabels();
});

When('I remove the first product from the cart', async function () {
    await this.cartPage.removeFirstItem();
});

Then('the cart should be empty', async function () {
    await this.cartPage.assertEmpty();
});

Then('the cart badge should not be visible', async function () {
    await this.commonPage.assertCartBadgeHidden();
});
