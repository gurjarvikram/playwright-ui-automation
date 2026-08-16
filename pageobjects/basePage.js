import { expect } from '@playwright/test';
import env from '../config/env.js';
import { commonObjects } from '../object-repository/index.js';

/**
 * Shared behaviour for every page.
 *
 * Page objects expose Playwright `Locator`s rather than selector strings. A Locator is lazy
 * and re-queries the DOM on every use, so it survives a re-render; a string handed to the
 * layer above would tempt that layer into building its own queries and would put selector
 * knowledge back into step definitions.
 */
export default class BasePage {
    /** @param {import('playwright').Page} page */
    constructor(page) {
        this.page = page;
    }

    // --- Locators -------------------------------------------------------------------

    get pageTitle() {
        return this.page.locator(commonObjects.pageTitle);
    }

    get errorMessage() {
        return this.page.locator(commonObjects.errorMessage);
    }

    get items() {
        return this.page.locator(commonObjects.item);
    }

    get itemNames() {
        return this.page.locator(commonObjects.itemName);
    }

    get cartLink() {
        return this.page.locator(commonObjects.cartLink);
    }

    get cartBadge() {
        return this.page.locator(commonObjects.cartBadge);
    }

    // --- Actions --------------------------------------------------------------------

    async goto(path = '/') {
        await this.page.goto(new URL(path, env.baseUrl).toString());
    }

    async openCart() {
        await this.cartLink.click();
    }

    /**
     * Product names in the order the page currently renders them.
     *
     * Reads through a locator that has already been asserted on, so the list is stable by
     * the time it is captured.
     */
    async getItemNames() {
        // Awaited rather than returned bare: awaiting keeps this frame in the async stack
        // trace, so a failure here points at the page object instead of at Playwright.
        return await this.itemNames.allInnerTexts();
    }

    // --- Assertions -----------------------------------------------------------------

    async assertPageTitle(expected) {
        await expect(this.pageTitle).toHaveText(expected);
    }

    async assertErrorMessage(expected) {
        await expect(this.errorMessage).toContainText(expected);
    }

    /** Asserts the browser is on `path` of the environment under test. */
    async assertPath(path) {
        await expect(this.page).toHaveURL(new URL(path, env.baseUrl).toString());
    }

    async assertCartBadgeHidden() {
        await expect(this.cartBadge).toBeHidden();
    }

    async assertCartBadgeCount(expected) {
        await expect(this.cartBadge).toHaveText(String(expected));
    }
}
