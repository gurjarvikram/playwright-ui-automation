import { expect } from '@playwright/test';
import BasePage from './basePage.js';
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

    /**
     * Fills the form and submits it.
     *
     * Takes credentials rather than a role name: which account a scenario uses is a test-data
     * decision, made in the step definition. A page object that looked the role up itself
     * would be coupled to where the suite happens to keep its accounts today.
     */
    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
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
