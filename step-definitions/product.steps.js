import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import env from '../config/env.js';

async function addFirstProductToCart(world) {
    await world.inventoryPage.addFirstProductToCart();
}

Then('the products page should be displayed', async function () {
    await expect(this.page.locator(this.inventoryPage.productTitle)).toHaveText('Products');
    this.defaultItemOrder = await this.inventoryPage.getItemNames();
});

When('I sort products by {string}', async function (label) {
    await this.inventoryPage.sortBy(label);
});

Then('the products should be listed in descending name order', async function () {
    const sortedItems = await this.inventoryPage.getItemNames();
    expect(sortedItems).toEqual([...this.defaultItemOrder].sort().reverse());
});

When('I add the first product to the cart', async function () {
    await addFirstProductToCart(this);
});

Given('I have added the first product to the cart', async function () {
    await addFirstProductToCart(this);
});

Given('I have added {int} products to the cart', async function (count) {
    await this.inventoryPage.addProductsToCart(count);
});

When('I open the cart', async function () {
    await this.inventoryPage.openCart();
});

Given('I proceed to checkout', async function () {
    await this.inventoryPage.openCart();
    await this.cartPage.clickCheckout();
});

Then('I should be on the cart page', async function () {
    await expect(this.page).toHaveURL(`${env.baseUrl}/cart.html`);
    await expect(this.page.locator(this.cartPage.pageTitle)).toHaveText('Your Cart');
});

Then('the cart page should display the standard cart labels', async function () {
    await expect(this.page.locator(this.cartPage.qtyLabel)).toContainText('QTY');
    await expect(this.page.locator(this.cartPage.descriptionLbl)).toContainText('Description');
    await expect(this.page.locator(this.cartPage.continueShoppingBtn)).toHaveText('Continue Shopping');
    await expect(this.page.locator(this.cartPage.checkoutBtn)).toHaveText('Checkout');
    await expect(this.page.locator(this.cartPage.itemName)).toBeVisible();
});

When('I remove the first product from the cart', async function () {
    await this.cartPage.removeFirstItem();
});

Then('the cart should be empty', async function () {
    await expect(this.page.locator(this.cartPage.itemName)).not.toBeVisible();
});

Then('the cart badge should not be visible', async function () {
    await expect(this.page.locator(this.inventoryPage.shoppingCartBadge)).not.toBeVisible();
});

When('I continue without entering any customer information', async function () {
    await this.checkoutInformationPage.clickContinue();
});

When('I enter my first name', async function () {
    await this.checkoutInformationPage.fillFirstName(this.customer.firstName);
});

When('I enter my last name', async function () {
    await this.checkoutInformationPage.fillLastName(this.customer.lastName);
});

When('I continue to the next step', async function () {
    await this.checkoutInformationPage.clickContinue();
});

When('I fill in valid customer information', async function () {
    await this.checkoutInformationPage.fillFirstName(this.customer.firstName);
    await this.checkoutInformationPage.fillLastName(this.customer.lastName);
    await this.checkoutInformationPage.fillZipCode(this.customer.zipCode);
});

Then('I should be on the checkout overview page', async function () {
    await expect(this.page).toHaveURL(`${env.baseUrl}/checkout-step-two.html`);
    await expect(this.page.locator(this.checkoutOverviewPage.pageTitle)).toHaveText('Checkout: Overview');
});

Then('the cart should contain {int} items', async function (count) {
    await expect(this.page.locator(this.checkoutOverviewPage.itemName)).toHaveCount(count);
});

Then('the checkout overview should display payment, shipping and price totals', async function () {
    await expect(this.page.locator(this.checkoutOverviewPage.paymentInfo)).toHaveText('Payment Information:');
    await expect(this.page.locator(this.checkoutOverviewPage.shippingInfo)).toContainText('Shipping Information:');
    await expect(this.page.locator(this.checkoutOverviewPage.priceTotal)).toContainText('Price Total');
    await expect(this.page.locator(this.checkoutOverviewPage.itemTotal)).toBeVisible();
    await expect(this.page.locator(this.checkoutOverviewPage.taxTotal)).toBeVisible();
});

When('I finish the checkout', async function () {
    await this.checkoutOverviewPage.finishCheckout();
});

Then('I should see the order confirmation message {string}', async function (message) {
    await this.checkoutOverviewPage.waitForOrderConfirmation();
    await expect(this.page.locator(this.checkoutOverviewPage.orderConfirmMsg)).toContainText(message);
});

Then('the back to products button should be visible', async function () {
    await expect(this.page.locator(this.checkoutOverviewPage.backButtonCompleteOrder)).toBeVisible();
});
