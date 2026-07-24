import env from '../config/env.js';

export default class BasePage {
    constructor(page) {
        this.page = page;
        this.errorMsg = "h3[data-test='error']";
    }

    async goto(path = '/') {
        await this.page.goto(new URL(path, env.baseUrl).toString());
    }

    locator(selector) {
        return this.page.locator(selector);
    }

    async click(selector) {
        await this.page.locator(selector).click();
    }

    async fill(selector, value) {
        await this.page.locator(selector).fill(value);
    }

    async getText(selector) {
        return this.page.locator(selector).innerText();
    }

    async getAllTexts(selector) {
        return this.page.locator(selector).allInnerTexts();
    }

    async isVisible(selector) {
        return this.page.locator(selector).isVisible();
    }
}
