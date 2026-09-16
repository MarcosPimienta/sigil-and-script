# Technical Design: Exclude Declined Guests from Floor Plan Seating

**Change ID:** `exclude-declined-guests-from-floor-plan`  
**Created:** 2026-09-16  

## Architectural Decisions

### 1. Invariant: Only Confirmed Attendees May Occupy Floor Plan Seats
- A seat is strictly considered **occupied** if and only if:
  1. `seat.assignedGuestId` is defined, **AND**
  2. `seat.assignedGuestId` exists in `confirmedAttendees` (`getConfirmedAttendees(invitees)`).
- If a guest declines (`RSVP_NO`) or their status is changed to non-attending:
  - Their seat assignment is immediately vacated in state.
  - Seating calculation utilities defensive-check against `confirmedAttendees` so even unpersisted or legacy stale seats are treated as vacant.

### 2. Auto-Unseating on State Mutations (`sigilStore.ts`)
When `updateInvitee(id, updates)` is called:
```typescript
if (updates.status === 'RSVP_NO') {
  // Collect invitee id and all its dependent ids
  const targetIds = new Set<string>([inviteeId]);
  const currentInv = state.guestRoster.invitees.find((i) => i.id === inviteeId);
  if (currentInv?.dependents) {
    currentInv.dependents.forEach((d) => targetIds.add(d.id));
  }
  // Clear any seats in state.design.floorPlan.tables assigned to these targetIds
  tables = tables.map(tbl => ({
    ...tbl,
    seats: tbl.seats.map(s => targetIds.has(s.assignedGuestId!) ? { id: s.id, seatNumber: s.seatNumber } : s)
  }));
}
```
Similarly, when `removeInvitee(inviteeId)` is called, any seats occupied by that invitee or their dependents are cleared.

### 3. Defensive Validation in Calculations (`floorPlanUtils.ts`)
- **`calculateSeatingStats`**:
  ```typescript
  const confirmedIdSet = new Set(confirmedAttendees.map((a) => a.id));
  for (const table of tables) {
    totalSeats += table.seats.length;
    for (const seat of table.seats) {
      if (seat.assignedGuestId && confirmedIdSet.has(seat.assignedGuestId)) {
        assignedAttendeeIds.add(seat.assignedGuestId);
      }
    }
  }
  ```
- **`generateTableSeatingManifest`**:
  ```typescript
  const isOccupied = Boolean(seat.assignedGuestId && attendeeMap.has(seat.assignedGuestId));
  ```

### 4. Table Node Rendering (`FloorPlanTableNode.tsx`)
- Pass `confirmedAttendees` (or a `confirmedGuestIds` set) down to `FloorPlanCanvas` and `FloorPlanTableNode`, or sanitize `tables` in `FloorPlanView` before rendering.
- Sanitizing in `FloorPlanView`:
  ```typescript
  const sanitizedTables = useMemo(() => {
    const confirmedSet = new Set(confirmedAttendees.map((a) => a.id));
    return tables.map((tbl) => ({
      ...tbl,
      seats: tbl.seats.map((s) => {
        if (s.assignedGuestId && !confirmedSet.has(s.assignedGuestId)) {
          return { id: s.id, seatNumber: s.seatNumber };
        }
        return s;
      }),
    }));
  }, [tables, confirmedAttendees]);
  ```
  This ensures:
  1. The canvas immediately renders stale/declined seats as vacant without requiring a manual save.
  2. Table statistics, tooltip popups, and click interactions are 100% synchronized with confirmed attendees.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Accidental seat loss if a guest status is temporarily edited | If a host accidentally marks a guest as declined, their seat is vacated. The host can re-seat them when marking them as RSVP_YES again. |
| Existing unit tests with mock tables containing synthetic guest IDs | Ensure tests pass valid mock confirmed attendee lists matching the mock seats, or update test fixtures. |
| Backend design persistence | When `sanitizedTables` differs from raw `tables`, auto-save or save on user action persists the clean state. |
