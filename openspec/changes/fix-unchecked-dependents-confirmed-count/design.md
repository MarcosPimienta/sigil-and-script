# Design: Fix Unchecked Dependents in Confirmed Guest Counts

## Architectural Decisions

### 1. Attending Count Calculation in `computeStats`
- **Logic**:
  - `total`: Remains the total allocated seats (primary guests + all dependents) so hosts know total invited capacity.
  - `attending`:
    - For `guestType === 'INDIVIDUAL'` with status `RSVP_YES`: `1 + (dependents.filter(d => d.included !== false).length)`.
    - For `guestType === 'FAMILY'` with status `RSVP_YES`: `dependents.filter(d => d.included !== false).length` (or `1` if the family record has 0 dependent sub-records).
    - If status is not `RSVP_YES`, attending count is `0`.

### 2. Confirmed Tree View Filtering in `GuestHierarchyTreeView`
- **Logic**:
  - When `statusFilter === 'ALL'`, show all dependents (and display an unchecked indicator or plain tree).
  - When `statusFilter === 'RSVP_YES'`, only display dependents who have `included === true` (or `included !== false`), and count only those included in the summary header.
  - Serializing via `formatGuestHierarchyText` respects this dependent filter so exported text contains only confirmed individuals.

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Dependents created without explicit `included` property (e.g. `undefined`) | Treat `d.included !== false` as included by default |
| Family with all dependents unchecked | In `attending`, if all dependents are unchecked (`included: false`), attending headcount is `0` |
