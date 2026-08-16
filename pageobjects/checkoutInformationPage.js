import BasePage from './basePage.js';
import { checkoutObjects } from '../object-repository/index.js';

const PAGE_TITLE = 'Checkout: Your Information';

export default class CheckoutInformationPage extends BasePage {
    get firstNameInput() {
        return this.page.locator(checkoutObjects.firstNameInput);
    }

    get lastNameInput() {
        return this.page.locator(checkoutObjects.lastNameInput);
    }

    get postalCodeInput() {
        return this.page.locator(checkoutObjects.postalCodeInput);
    }

    get continueButton() {
        return this.page.locator(checkoutObjects.continueButton);
    }

    get cancelButton() {
        return this.page.locator(checkoutObjects.cancelButton);
    }

    // --- Actions --------------------------------------------------------------------

    async enterFirstName(value) {
        await this.firstNameInput.fill(value);
    }

    async enterLastName(value) {
        await this.lastNameInput.fill(value);
    }

    async enterPostalCode(value) {
        await this.postalCodeInput.fill(value);
    }

    /** @param {{ firstName: string, lastName: string, postalCode: string }} customer */
    async enterCustomerDetails(customer) {
        await this.enterFirstName(customer.firstName);
        await this.enterLastName(customer.lastName);
        await this.enterPostalCode(customer.postalCode);
    }

    async continueToOverview() {
        await this.continueButton.click();
    }

    // --- Assertions -----------------------------------------------------------------

    async assertLoaded() {
        await this.assertPath('/checkout-step-one.html');
        await this.assertPageTitle(PAGE_TITLE);
    }
}
