# Technical Design: Align Family Guest Attendance and Headcount Calculations

**Change ID:** `align-family-guest-attendance-counts`
**Created:** 2026-09-08

## Architectural Decisions

### 1. Unified Counting Invariant Across the Domain
- **Decision**: Every invitee record represents **one primary human attendee** plus zero or more **dependent attendees**.
- **Rationale**:
  - In physical event logistics, catering, and banquet seating:
    - Every primary invitee in an `RSVP_YES` record is a real person attending the venue and consuming a meal.
    - Every confirmed dependent is an additional person attending the venue and consuming a meal.
  - Previous code attempted to treat `guestType === 'FAMILY'` as an abstract group container where the primary record had zero seats if dependents existed. This caused:
    - The primary guest to be excluded from dashboard attending counts.
    - An irreconcilable mismatch between the Dashboard (129) and the Floor Plan / Seating Manifest (130).
  - Unifying the formula to `1 + includedDependents` guarantees that:
    - `DashboardStats.attending` $\equiv$ `floorPlanUtils.getConfirmedAttendees().length` $\equiv$ `GuestHierarchyTreeView.filteredTotal`.
    - Zero special-casing bugs when switching guest categories.

### 2. Implementation Details

#### `DashboardStats.tsx` (`computeStats`)
```typescript
const getGuestCount = (i: InviteeRecord) => {
  return 1 + (i.dependents?.length || 0);
};

const getAttendingGuestCount = (i: InviteeRecord) => {
  const includedDeps = i.dependents
    ? i.dependents.filter((d) => d.included === true || d.included === ('true' as any)).length
    : 0;
  return 1 + includedDeps;
};
```

#### `CreatorCanvas.tsx`
```typescript
const depsCount = Math.max(state.guest.additionalGuests?.length || 0, state.guest.dependents?.length || 0);
const reservedSeats = 1 + depsCount;
```

### 3. Preserving Family Phrasing and Category Badges
- `guestType: 'FAMILY'` will still control:
  - Form field styling and placeholders in `AddInviteeForm`.
  - The `👨‍👩‍👧‍👦 Family` category badge in `InviteeRow` and `DashboardView`.
  - Invitation heading formatting in `formatGuestTitleName` (e.g. *"Familia Marcos Pimienta"*).
- Only the mathematical headcount calculation is unified.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Existing tests expecting family primary exclusion | Update `DashboardStats.test.ts` to assert `1 + dependents` for family entries; run full vitest suite to ensure no regressions. |
| Confusion if someone creates a family with name "Familia Gómez" and also lists the parents as dependents | The host can choose who is listed in the roster; in event seating, every named seat corresponds 1-to-1 to an attendee. |
