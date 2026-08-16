export const checkoutObjects = Object.freeze({
    // Step one: customer information.
    firstNameInput: '[data-test="firstName"]',
    lastNameInput: '[data-test="lastName"]',
    postalCodeInput: '[data-test="postalCode"]',
    continueButton: '[data-test="continue"]',
    cancelButton: '[data-test="cancel"]',

    // Step two: order overview.
    paymentInfoLabel: '[data-test="payment-info-label"]',
    paymentInfoValue: '[data-test="payment-info-value"]',
    shippingInfoLabel: '[data-test="shipping-info-label"]',
    shippingInfoValue: '[data-test="shipping-info-value"]',
    totalInfoLabel: '[data-test="total-info-label"]',
    subtotalLabel: '[data-test="subtotal-label"]',
    taxLabel: '[data-test="tax-label"]',
    totalLabel: '[data-test="total-label"]',
    finishButton: '[data-test="finish"]',

    // Step three: confirmation.
    completeHeader: '[data-test="complete-header"]',
    completeText: '[data-test="complete-text"]',
    backToProductsButton: '[data-test="back-to-products"]',
});
