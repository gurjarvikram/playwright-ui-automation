import { Given, When, Then } from '@cucumber/cucumber';

Given('I proceed to checkout', async function () {
    await this.inventoryPage.openCart();
    await this.cartPage.assertLoaded();
    await this.cartPage.proceedToCheckout();
    await this.checkoutInformationPage.assertLoaded();
});

When('I continue without entering any customer information', async function () {
    await this.checkoutInformationPage.continueToOverview();
});

When('I continue to the next step', async function () {
    await this.checkoutInformationPage.continueToOverview();
});

When('I enter my first name', async function () {
    await this.checkoutInformationPage.enterFirstName(this.customer.firstName);
});

When('I enter my last name', async function () {
    await this.checkoutInformationPage.enterLastName(this.customer.lastName);
});

When('I fill in valid customer information', async function () {
    await this.checkoutInformationPage.enterCustomerDetails(this.customer);
});

Then('I should be on the checkout overview page', async function () {
    await this.checkoutOverviewPage.assertLoaded();
});

Then('the cart should contain {int} items', async function (count) {
    await this.checkoutOverviewPage.assertItemCount(count);
});

Then('the checkout overview should display payment, shipping and price totals', async function () {
    await this.checkoutOverviewPage.assertSummaryDisplayed();
});

Then('the order total should equal the item subtotal plus tax', async function () {
    await this.checkoutOverviewPage.assertTotalIsSubtotalPlusTax();
});

When('I finish the checkout', async function () {
    await this.checkoutOverviewPage.finishCheckout();
});

Then('I should see the order confirmation message {string}', async function (message) {
    await this.checkoutOverviewPage.assertOrderConfirmed(message);
});

Then('the back to products button should be visible', async function () {
    await this.checkoutOverviewPage.assertBackToProductsAvailable();
});
