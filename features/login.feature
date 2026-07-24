@login
Feature: Login
  As a Sauce Demo user
  I want to log in
  So that I can access the store

  Background:
    Given I am on the login page

  Scenario: Login validation when no credentials are entered
    When I click the login button
    Then I should still be on the login page
    And I should see the error message "Epic sadface: Username is required"

  Scenario: Unsuccessful login due to invalid credentials
    When I log in with username "fakeusername" and password "fakepwd"
    Then I should see the error message "Epic sadface: Username and password do not match any user in this service"

  Scenario: Successful login with valid credentials
    When I log in with valid credentials
    Then I should be redirected to the inventory page
