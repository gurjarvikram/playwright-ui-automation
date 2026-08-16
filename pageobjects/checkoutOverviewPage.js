import { expect } from '@playwright/test';
import CartPage from './cartPage.js';
import { checkoutObjects } from '../object-repository/index.js';

const PAGE_TITLE = 'Checkout: Overview';
const COMPLETE_PAGE_TITLE = 'Checkout: Complete!';

/**
 * The order overview, and the confirmation page it leads to.
 *
 * Extends CartPage because the overview renders the same line-item table and reuses its
 * quantity and description labels; only the summary block and the finish action are new.
 */
export default class CheckoutOverviewPage extends CartPage {
    get paymentInfoLabel() {
        return this.page.locator(checkoutObjects.paymentInfoLabel);
    }

    get shippingInfoLabel() {
        return this.page.locator(checkoutObjects.shippingInfoLabel);
    }

    get totalInfoLabel() {
        return this.page.locator(checkoutObjects.totalInfoLabel);
    }

    get subtotalLabel() {
        return this.page.locator(checkoutObjects.subtotalLabel);
    }

    get taxLabel() {
        return this.page.locator(checkoutObjects.taxLabel);
    }

    get totalLabel() {
        return this.page.locator(checkoutObjects.totalLabel);
    }

    get finishButton() {
        return this.page.locator(checkoutObjects.finishButton);
    }

    get completeHeader() {
        return this.page.locator(checkoutObjects.completeHeader);
    }

    get backToProductsButton() {
        return this.page.locator(checkoutObjects.backToProductsButton);
    }

    // --- Actions --------------------------------------------------------------------

    async finishCheckout() {
        await this.finishButton.click();
    }

    // --- Assertions -----------------------------------------------------------------

    async assertLoaded() {
        await this.assertPath('/checkout-step-two.html');
        await this.assertPageTitle(PAGE_TITLE);
    }

    async assertSummaryDisplayed() {
        await expect(this.paymentInfoLabel).toHaveText('Payment Information:');
        await expect(this.shippingInfoLabel).toContainText('Shipping Information:');
        await expect(this.totalInfoLabel).toContainText('Price Total');
        await expect(this.subtotalLabel).toBeVisible();
        await expect(this.taxLabel).toBeVisible();
        await expect(this.totalLabel).toBeVisible();
    }

    /**
     * The stated total is the item subtotal plus tax.
     *
     * Derived from the two component figures rather than re-reading the total element,
     * because comparing the page's own rendering against itself always passes.
     */
    async assertTotalIsSubtotalPlusTax() {
        const amount = async (locator) => {
            const text = await locator.innerText();
            const parsed = Number(text.replace(/[^0-9.]/g, ''));
            expect(Number.isNaN(parsed), `could not parse an amount from "${text}"`).toBe(false);
            return parsed;
        };

        const [subtotal, tax, total] = await Promise.all([
            amount(this.subtotalLabel),
            amount(this.taxLabel),
            amount(this.totalLabel),
        ]);

        expect(Number((subtotal + tax).toFixed(2))).toBe(total);
    }

    async assertOrderConfirmed(message) {
        await this.assertPath('/checkout-complete.html');
        await this.assertPageTitle(COMPLETE_PAGE_TITLE);
        await expect(this.completeHeader).toContainText(message);
    }

    async assertBackToProductsAvailable() {
        await expect(this.backToProductsButton).toBeVisible();
    }
}
