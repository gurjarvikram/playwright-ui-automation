import BasePage from './basePage.js';

export default class CartPage extends BasePage {
    constructor(page) {
        super(page);
        this.pageTitle = '.title';
        this.itemName = "div[class='inventory_item_name']";
        this.qtyLabel = '.cart_quantity_label';
        this.descriptionLbl = '.cart_desc_label';
        this.cartItem = '.cart_item';
        this.continueShoppingBtn = '#continue-shopping';
        this.checkoutBtn = '#checkout';
    }

    async getPageTitle() {
        return this.getText(this.pageTitle);
    }

    async getItemNames() {
        return this.getAllTexts(this.itemName);
    }

    async getItemCount() {
        return this.page.locator(this.itemName).count();
    }

    async removeFirstItem() {
        await this.page.locator(this.cartItem).first().getByRole('button', { name: 'Remove' }).click();
    }

    async clickCheckout() {
        await this.click(this.checkoutBtn);
    }
}
