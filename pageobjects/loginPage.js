import { expect } from '@playwright/test';
import BasePage from './basePage.js';
import env from '../config/env.js';
import { loginObjects } from '../object-repository/index.js';

export default class LoginPage extends BasePage {
    get usernameInput() {
        return this.page.locator(loginObjects.usernameInput);
    }

    get passwordInput() {
        return this.page.locator(loginObjects.passwordInput);
    }

    get loginButton() {
        return this.page.locator(loginObjects.loginButton);
    }

    // --- Actions --------------------------------------------------------------------

    async open() {
        await this.goto('/');
        await expect(this.loginButton).toBeVisible();
    }

    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    /**
     * Logs in as a named account from fixtures/users.json.
     *
     * @param {string} [role] key in fixtures/users.json — defaults to the standard user
     */
    async loginAs(role = 'standard') {
        const { username, password } = env.user(role);
        await this.login(username, password);
    }

    async submit() {
        await this.loginButton.click();
    }

    // --- Assertions -----------------------------------------------------------------

    /** The form is still on screen, i.e. the attempt did not navigate away. */
    async assertStillOnLoginPage() {
        await expect(this.loginButton).toBeVisible();
        await this.assertPath('/');
    }
}
