import { expect } from '@playwright/test';
import BasePage from './basePage.js';
import { inventoryObjects } from '../object-repository/index.js';

const PAGE_TITLE = 'Products';

export default class InventoryPage extends BasePage {
    get sortContainer() {
        return this.page.locator(inventoryObjects.sortContainer);
    }

    get activeSortOption() {
        return this.page.locator(inventoryObjects.activeSortOption);
    }

    // --- Actions --------------------------------------------------------------------

    async sortBy(optionLabel) {
        await this.sortContainer.selectOption({ label: optionLabel });
        // The dropdown writes the chosen label into the active-option element. Asserting on
        // it here means the sort has actually been applied before the caller reads the list,
        // without anyone needing a fixed wait.
        await expect(this.activeSortOption).toHaveText(optionLabel);
    }

    /**
     * Adds the first `count` products in the current listing order.
     *
     * Scoped to the item tile and matched by role, so it adds the nth *visible* product
     * without the test needing to know which product that happens to be.
     */
    async addProductsToCart(count) {
        for (let index = 0; index < count; index += 1) {
            await this.items.nth(index).getByRole('button', { name: 'Add to cart' }).click();
        }
        await this.assertCartBadgeCount(count);
    }

    async addFirstProductToCart() {
        await this.addProductsToCart(1);
    }

    // --- Assertions -----------------------------------------------------------------

    async assertLoaded() {
        await this.assertPath('/inventory.html');
        await this.assertPageTitle(PAGE_TITLE);
    }

    /**
     * @param {string[]} expectedOrder product names in the order they should appear
     */
    async assertItemOrder(expectedOrder) {
        await expect(this.itemNames).toHaveText(expectedOrder);
    }
}
