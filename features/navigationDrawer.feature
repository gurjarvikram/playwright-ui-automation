@navigation
Feature: Navigation drawer
  As a logged in Sauce Demo user
  I want to use the side navigation drawer
  So that I can move around the app or log out

  Background:
    Given I am logged in as a standard user
    And I open the navigation drawer

  Scenario: Verify the data points on the left navigation drawer
    Then the navigation drawer should show the following menu items in order:
      | All Items        |
      | About             |
      | Logout            |
      | Reset App State   |

  Scenario: Logout functionality
    When I click logout
    Then the navigation drawer should be hidden

  Scenario: Closing the navigation drawer
    When I close the navigation drawer
    Then I should remain on the inventory page
