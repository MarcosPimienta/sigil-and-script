# Specification: Fix Unchecked Dependents in Confirmed Guest Counts

## Feature: Accurate Attending Headcount for Partial Parties
Ensures that dependents who have `included: false` (unchecked attendance) are excluded from confirmed attending headcount totals and confirmed hierarchy exports.

### Scenario: Individual guest with partially attending dependents
- **GIVEN** an individual guest with 2 dependents, where 1 dependent has `included: true` and 1 dependent has `included: false`
- **AND** the primary guest's status is `RSVP_YES`
- **WHEN** statistics are computed in `DashboardStats`
- **THEN** the `attending` count is 2 (1 primary + 1 checked dependent).

### Scenario: Confirmed tree view excludes unchecked dependents
- **GIVEN** a guest in `RSVP_YES` with 1 checked dependent and 1 unchecked dependent
- **WHEN** the host filters the tree view by `Confirmed` (`RSVP_YES`)
- **THEN** only the checked dependent is rendered under the guest
- **AND** only the checked dependent is included when clicking "Copy as Text".
