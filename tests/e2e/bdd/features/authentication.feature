Feature: Authentication API

  As an API client
  I want to authenticate users
  So that users can securely access the system

  Scenario: Successfully register a new user
    Given I have valid registration data
    When I send a registration request
    Then the registration should be successful

  Scenario: Successfully login with valid credentials
    Given I have a registered user
    When I login with valid credentials
    Then I should receive an authentication token

  Scenario: Login with invalid password
    Given I have a registered user
    When I login with an invalid password
    Then the login should be rejected with status 401

  Scenario: Login with non existing user
    Given I have credentials for a non existing user
    When I attempt to login
    Then the login should be rejected with status 404