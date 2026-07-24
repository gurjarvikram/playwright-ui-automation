import BasePage from './basePage.js';
import env from '../config/env.js';

export default class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.usernameInput = '#user-name';
        this.passwordInput = '#password';
        this.loginButtonLocator = '#login-button';
        this.titleInventory = "span[data-test='title']";
    }

    async gotoLoginPage() {
        await this.goto('/');
    }

    async enterUsername(value) {
        await this.fill(this.usernameInput, value);
    }

    async enterPassword(value) {
        await this.fill(this.passwordInput, value);
    }

    async clickLoginButton() {
        await this.click(this.loginButtonLocator);
    }

    async login(username, password) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    async loginAsStandardUser() {
        await this.login(env.username, env.password);
    }

    async getErrorMessage() {
        return this.getText(this.errorMsg);
    }
}
