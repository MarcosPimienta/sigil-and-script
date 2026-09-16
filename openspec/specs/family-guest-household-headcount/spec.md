# Specification: Family Guest Household Headcount

**Spec ID:** `family-guest-household-headcount`  
**Capability:** HOST tenant → Household Headcount & Seating

## Requirements

### Requirement: Household Container Headcount Calculation

The system SHALL treat family invitations (`guestType === 'FAMILY'`) as household containers where the registered members (`dependents`) constitute the actual attendees.

#### Scenario: Adding a Family of 2 in Pending Status
- **GIVEN** an invitee with `name: "Familia Gómez"`, `guestType: 'FAMILY'`, `status: 'PENDING'`, and 2 dependents (`"Carlos"` and `"Ana"`)
- **WHEN** `DashboardStats` computes headcounts
- **THEN** the pending count for this family evaluates to `2` (not 3)
- **AND** the total guest count for this family evaluates to `2`.

#### Scenario: Family Entry with No Enumerated Members
- **GIVEN** an invitee with `name: "Familia Pérez"`, `guestType: 'FAMILY'`, `status: 'PENDING'`, and 0 dependents
- **WHEN** `DashboardStats` computes headcounts
- **THEN** the pending count evaluates to `1` as an unassigned household placeholder.

#### Scenario: Seating Allocation for Confirmed Family Guests
- **GIVEN** an invitee with `name: "Familia Gómez"`, `guestType: 'FAMILY'`, `status: 'RSVP_YES'`, and 2 confirmed dependents (`"Carlos"` and `"Ana"`)
- **WHEN** `floorPlanUtils.getConfirmedAttendees` generates the attendee list for seating
- **THEN** exactly 2 attendee seats are created (for `"Carlos"` and `"Ana"`)
- **AND** no extraneous seat is allocated for `"Familia Gómez"`.

#### Scenario: Invitation Card Reserved Seats Display
- **GIVEN** an invitee with `guestType: 'FAMILY'` and 2 dependents
- **WHEN** the invitation card is rendered in `CreatorCanvas`
- **THEN** `reservedSeats` evaluates to `2`, indicating "We have reserved 2 seats for you".
