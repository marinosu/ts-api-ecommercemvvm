Feature: User Management API

  As an authenticated API client
  I want to manage user information
  So that I can maintain my profile

  Scenario: Successfully retrieve an existing user
    Given I have an authenticated user
    When I request the user information
    Then I should receive the user information successfully

  Scenario: Successfully update an existing user
    Given I have an authenticated user
    When I update the user information
    Then the user information should be updated successfully