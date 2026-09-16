# Specification: Exclude Declined Guests from Floor Plan

**Spec ID:** `exclude-declined-guests-from-floor-plan`  
**Capability:** HOST tenant → Floor Plan Seating & Attendance Invariant

## Requirements

### Requirement: Exclusion of Declined Guests from Seating

The system SHALL enforce that only confirmed attendees (`RSVP_YES`) may occupy seats on tables, and SHALL automatically vacate seats when an invitee declines or is removed.

#### Scenario: Declined Guest Seat Vacated on Status Change
- **GIVEN** a table seat assigned to guest `"Pedro Pascal"`
- **WHEN** the host changes Pedro Pascal's status to `RSVP_NO` (or the guest submits RSVP declining)
- **THEN** Pedro Pascal's seat is vacated and marked as available
- **AND** the table occupancy count decreases by 1.

#### Scenario: Declined Guest Excluded from Seating Statistics
- **GIVEN** 2 confirmed guests and 1 table with 4 seats
- **AND** 1 seat is occupied by a confirmed guest and 1 seat has a stale assignment for a declined guest
- **WHEN** `calculateSeatingStats` computes seating metrics
- **THEN** `seatedCount` evaluates to `1` (counting only the confirmed guest)
- **AND** `unassignedCount` evaluates to `1`.

#### Scenario: Table Seating Manifest Ignores Declined Guests
- **GIVEN** a table with a seat assigned to an invitee whose status is `RSVP_NO`
- **WHEN** the host views or exports the Seating Manifest
- **THEN** that seat is listed as empty / unoccupied.

#### Scenario: Deleting an Invitee Clears Assigned Seats
- **GIVEN** a guest assigned to Table 1, Seat 2
- **WHEN** the host removes the guest from the roster
- **THEN** Table 1, Seat 2 is vacated.
