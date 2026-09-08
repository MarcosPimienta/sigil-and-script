# Delta Spec: Align Family Guest Attendance and Headcount Calculations

**Spec ID:** `align-family-guest-attendance-counts`
**Capability:** HOST tenant → Consistent Guest Headcount & Attendance

## MODIFIED Requirements

### Requirement: Unified Attending Headcount Calculation

The system SHALL compute guest headcount and attending totals consistently across all views, counting each confirmed primary invitee as 1 attendee and each confirmed dependent as 1 attendee, regardless of guest category (`INDIVIDUAL` vs `FAMILY`).

#### Scenario: Computing Dashboard Attending Count for Family Entries
- **WHEN** an invitee with `guestType: 'FAMILY'` and status `RSVP_YES` has $N$ confirmed dependents (`included: true`)
- **THEN** `DashboardStats` counts $1 + N$ attendees for that party.

#### Scenario: Alignment with Floor Plan and Seating Manifest
- **WHEN** a host views the Dashboard header and the Floor Plan or Seating Manifest
- **THEN** the total attending count shown in the Dashboard matches the confirmed attendee count in the Floor Plan and Seating Manifest.

#### Scenario: Recipient Reserved Seats Allocation
- **WHEN** a recipient with `guestType: 'FAMILY'` opens an invitation with $N$ dependents
- **THEN** `reservedSeats` evaluates to $1 + N$, guaranteeing seats for both the primary contact and all family dependents.
