import BasePage from './basePage.js';

export default class InventoryPage extends BasePage {
    constructor(page) {
        super(page);
        this.productTitle = '.title';
        this.productSort = '.product_sort_container';
        this.itemName = "div[class='inventory_item_name']";
        this.inventoryItem = '.inventory_item';
        this.shoppingCartBadge = '.shopping_cart_badge';
    }

    async getPageTitle() {
        return this.getText(this.productTitle);
    }

    async sortBy(label) {
        await this.page.locator(this.productSort).selectOption({ label });
    }

    async getItemNames() {
        return this.getAllTexts(this.itemName);
    }

    async addProductsToCart(count) {
        const items = this.page.locator(this.inventoryItem);
        for (let i = 0; i < count; i++) {
            await items.nth(i).getByRole('button', { name: 'Add to cart' }).click();
        }
    }

    async addFirstProductToCart() {
        await this.addProductsToCart(1);
    }

    async openCart() {
        await this.click(this.shoppingCartBadge);
    }

    async isCartBadgeVisible() {
        return this.isVisible(this.shoppingCartBadge);
    }
}
