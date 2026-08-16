import { expect } from '@playwright/test';
import BasePage from './basePage.js';
import { cartObjects } from '../object-repository/index.js';

const PAGE_TITLE = 'Your Cart';

export default class CartPage extends BasePage {
    get quantityLabel() {
        return this.page.locator(cartObjects.quantityLabel);
    }

    get descriptionLabel() {
        return this.page.locator(cartObjects.descriptionLabel);
    }

    get continueShoppingButton() {
        return this.page.locator(cartObjects.continueShoppingButton);
    }

    get checkoutButton() {
        return this.page.locator(cartObjects.checkoutButton);
    }

    // --- Actions --------------------------------------------------------------------

    async removeFirstItem() {
        await this.items.first().getByRole('button', { name: 'Remove' }).click();
    }

    async proceedToCheckout() {
        await this.checkoutButton.click();
    }

    // --- Assertions -----------------------------------------------------------------

    async assertLoaded() {
        await this.assertPath('/cart.html');
        await this.assertPageTitle(PAGE_TITLE);
    }

    /** The column headers and both call-to-action buttons the cart always shows. */
    async assertStandardLabels() {
        await expect(this.quantityLabel).toContainText('QTY');
        await expect(this.descriptionLabel).toContainText('Description');
        await expect(this.continueShoppingButton).toHaveText('Continue Shopping');
        await expect(this.checkoutButton).toHaveText('Checkout');
    }

    async assertItemCount(expected) {
        await expect(this.itemNames).toHaveCount(expected);
    }

    async assertEmpty() {
        await expect(this.itemNames).toHaveCount(0);
    }
}
