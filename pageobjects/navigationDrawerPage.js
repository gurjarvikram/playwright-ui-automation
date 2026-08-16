import { expect } from '@playwright/test';
import BasePage from './basePage.js';
import { navigationObjects } from '../object-repository/index.js';

export default class NavigationDrawerPage extends BasePage {
    get openMenuButton() {
        return this.page.locator(navigationObjects.openMenuButton);
    }

    get closeMenuButton() {
        return this.page.locator(navigationObjects.closeMenuButton);
    }

    get logoutLink() {
        return this.page.locator(navigationObjects.logoutLink);
    }

    get allItemsLink() {
        return this.page.locator(navigationObjects.allItemsLink);
    }

    get drawerItems() {
        return this.page.locator(navigationObjects.drawerItem);
    }

    // --- Actions --------------------------------------------------------------------

    async open() {
        await this.openMenuButton.click();
        // The drawer slides in. Waiting on the first item being actionable ties the next
        // step to the animation finishing, rather than to a guessed duration.
        await expect(this.drawerItems.first()).toBeVisible();
    }

    async close() {
        await this.closeMenuButton.click();
    }

    async logout() {
        await this.logoutLink.click();
    }

    // --- Assertions -----------------------------------------------------------------

    /**
     * @param {string[]} expectedItems menu labels, in the order they should appear
     */
    async assertMenuItems(expectedItems) {
        await expect(this.drawerItems).toHaveText(expectedItems);
    }

    async assertHidden() {
        await expect(this.drawerItems.first()).toBeHidden();
    }
}
