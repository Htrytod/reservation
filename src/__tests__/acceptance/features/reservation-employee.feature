Feature: Reservation employ

  Background: I am a employee

  @employeeLoggedIn
  Scenario: Restaurant employees should able to update reservations
    Given guest have added a reservation
    Then I update the reservation

  @employeeLoggedIn
  Scenario Outline: Restaurant employees should able to mark a reservation as completed or canceled
    Given guest have added a reservation
    Then I make the reservation as <status>
    Examples:
      | status    |
      | completed |
      | canceled  |

  @employeeLoggedIn
  Scenario: Restaurant employees should able to browse all the reservations by date and status
    Given guest have added some reservations
    Then I browse the reservations

  @employeeLoggedIn
  Scenario: Restaurant employees should able to check reservation detail
    Given guest have added a reservation
    Then I check the reservation detail