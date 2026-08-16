export const inventoryObjects = Object.freeze({
    sortContainer: '[data-test="product-sort-container"]',
    activeSortOption: '[data-test="active-option"]',

    // Parameterised entries are plain functions. The slug is the product name lowercased
    // with spaces replaced by hyphens, e.g. "sauce-labs-backpack".
    addToCart: (productSlug) => `[data-test="add-to-cart-${productSlug}"]`,
});
