import BasePage from './basePage.js';

export default class CheckoutInformationPage extends BasePage {
    constructor(page) {
        super(page);
        this.pageTitle = '.title';
        this.firstNameInput = '#first-name';
        this.lastNameInput = '#last-name';
        this.zipCodeInput = '#postal-code';
        this.continueBtn = '#continue';
    }

    async getPageTitle() {
        return this.getText(this.pageTitle);
    }

    async fillFirstName(value) {
        await this.fill(this.firstNameInput, value);
    }

    async fillLastName(value) {
        await this.fill(this.lastNameInput, value);
    }

    async fillZipCode(value) {
        await this.fill(this.zipCodeInput, value);
    }

    async clickContinue() {
        await this.click(this.continueBtn);
    }

    async getErrorMessage() {
        return this.getText(this.errorMsg);
    }
}
