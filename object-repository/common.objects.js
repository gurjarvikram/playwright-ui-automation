/**
 * Selectors that appear on more than one page: the header, the page heading, the error
 * banner, and the product/cart item tile that the inventory, cart and overview pages all
 * render with the same markup.
 */
export const commonObjects = Object.freeze({
    pageTitle: '[data-test="title"]',

    // The same attribute is used for the login error and the checkout validation error.
    // Only one is ever on screen at a time, so a single entry serves both.
    errorMessage: '[data-test="error"]',

    item: '[data-test="inventory-item"]',
    itemName: '[data-test="inventory-item-name"]',
    itemPrice: '[data-test="inventory-item-price"]',

    cartLink: '[data-test="shopping-cart-link"]',
    cartBadge: '[data-test="shopping-cart-badge"]',
});
