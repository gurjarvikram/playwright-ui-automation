@product @regression
Feature: Product listing, cart and checkout
  As a logged in Sauce Demo user
  I want to browse, sort and purchase products
  So that I can complete a checkout

  Background:
    Given I am logged in as a standard user

  Scenario: Sorting products from Z to A
    Then the products page should be displayed
    When I sort products by "Name (Z to A)"
    Then the products should be listed in descending name order

  Scenario: Add and remove product from cart
    When I add the first product to the cart
    And I open the cart
    Then I should be on the cart page
    And the cart page should display the standard cart labels
    When I remove the first product from the cart
    Then the cart should be empty
    And the cart badge should not be visible

  @negative
  Scenario: Checkout validation for required customer information
    Given I have added the first product to the cart
    And I proceed to checkout
    When I continue without entering any customer information
    Then I should see the error message "Error: First Name is required"
    When I enter my first name
    And I continue to the next step
    Then I should see the error message "Error: Last Name is required"
    When I enter my last name
    And I continue to the next step
    Then I should see the error message "Error: Postal Code is required"

  @smoke
  Scenario Outline: Checkout process with <productCount> products
    Given I have added <productCount> products to the cart
    And I proceed to checkout
    When I fill in valid customer information
    And I continue to the next step
    Then I should be on the checkout overview page
    And the cart should contain <productCount> items
    And the checkout overview should display payment, shipping and price totals
    And the order total should equal the item subtotal plus tax
    When I finish the checkout
    Then I should see the order confirmation message "Thank you for your order!"
    And the back to products button should be visible

    Examples:
      | productCount |
      | 1            |
      | 2            |
