import CartPage from './cartPage.js';

export default class CheckoutOverviewPage extends CartPage {
    constructor(page) {
        super(page);
        this.cancelBtn = '#cancel';
        this.finishBtn = '#finish';
        this.paymentInfo = "div[data-test='payment-info-label']";
        this.shippingInfo = "div[data-test='shipping-info-label']";
        this.priceTotal = "div[data-test='total-info-label']";
        this.itemTotal = '.summary_subtotal_label';
        this.taxTotal = '.summary_tax_label';
        this.orderConfirmMsg = '.complete-header';
        this.backButtonCompleteOrder = '#back-to-products';
    }

    async finishCheckout() {
        await this.click(this.finishBtn);
    }

    async waitForOrderConfirmation() {
        await this.page.locator(this.orderConfirmMsg).waitFor({ state: 'visible' });
    }

    async getOrderConfirmationMessage() {
        return this.getText(this.orderConfirmMsg);
    }
}
