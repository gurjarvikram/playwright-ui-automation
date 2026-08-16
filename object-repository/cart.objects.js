export const cartObjects = Object.freeze({
    quantityLabel: '[data-test="cart-quantity-label"]',
    descriptionLabel: '[data-test="cart-desc-label"]',
    itemQuantity: '[data-test="item-quantity"]',
    continueShoppingButton: '[data-test="continue-shopping"]',
    checkoutButton: '[data-test="checkout"]',

    removeFromCart: (productSlug) => `[data-test="remove-${productSlug}"]`,
});
