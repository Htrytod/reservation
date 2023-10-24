Feature: Reservation guest

  Background: I am a guest

  @guestLoggedIn
  Scenario Outline: Guests should able to make reservations
    When I add a reservation:<contactInfo>,<expectedArrivalTime>,<reservedTableSizeInfo>
    Then I find the reservation
    Examples:
      | contactInfo | expectedArrivalTime      | reservedTableSizeInfo |
      | 13011112222 | 2023-10-24T12:00:00.000Z | 2                     |
      | 13011113333 | 2023-10-25T12:00:00.000Z | 3                     |
      | 13011112222 | 2023-10-26T12:00:00.000Z | 4                     |

  @guestLoggedIn
  Scenario: Guests should able to update their reservations
    Given I have added a reservation
    Then I update my reservation

  @guestLoggedIn
  Scenario: Guests should able to cancel their reservations
    Given I have added a reservation
    Then I cancel my reservation

