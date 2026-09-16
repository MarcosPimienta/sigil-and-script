# Technical Design: Treat Family Guests as Household Containers

**Change ID:** `family-guest-household-headcount`  
**Created:** 2026-09-16  

## Architectural Decisions

### 1. Household Container vs. Individual Person
- **Individual (`guestType === 'INDIVIDUAL'`)**:
  - The record's `name` represents an actual person attending the event (1 attendee).
  - Any dependents attached are additional attendees (`+ N`).
  - Total headcount formula: $1 + N$.
- **Family (`guestType === 'FAMILY'`)**:
  - The record's `name` is the household title (e.g., *"Familia Gómez"*).
  - The registered members in `dependents` are the actual attendees.
  - When $N > 0$ dependents exist:
    - Headcount is $N$ (the family members).
    - Physical seats allocated are $N$.
  - When $N = 0$ (a family invitation created without enumerated members yet):
    - Headcount falls back to $1$ (representing the single unassigned family placeholder).
    - Physical seats allocated = $1$.

### 2. Implementation Specifications

#### `DashboardStats.tsx`
```typescript
const getGuestCount = (i: InviteeRecord) => {
  const depsCount = i.dependents?.length || 0;
  if (i.guestType === 'FAMILY') {
    return depsCount > 0 ? depsCount : 1;
  }
  return 1 + depsCount;
};

const getAttendingGuestCount = (i: InviteeRecord) => {
  const includedDeps = i.dependents
    ? i.dependents.filter((d) => d.included === true || d.included === ('true' as any)).length
    : 0;
  if (i.guestType === 'FAMILY') {
    return includedDeps > 0 ? includedDeps : (i.dependents && i.dependents.length > 0 ? 0 : 1);
  }
  return 1 + includedDeps;
};
```

#### `floorPlanUtils.ts` (`getConfirmedAttendees`)
```typescript
for (const inv of invitees) {
  if (inv.status === 'RSVP_YES') {
    const isFamily = inv.guestType === 'FAMILY';
    const deps = Array.isArray(inv.dependents) ? inv.dependents : [];
    const includedDeps = deps.filter((dep) => dep.included === true || (dep as any).included === 'true');

    if (isFamily && deps.length > 0) {
      for (const dep of includedDeps) {
        result.push({
          id: dep.id,
          name: dep.name,
          isDependent: true,
          primaryInviteeId: inv.id,
          primaryInviteeName: inv.name,
        });
      }
    } else {
      result.push({
        id: inv.id,
        name: inv.name,
        isDependent: false,
        primaryInviteeId: inv.id,
        primaryInviteeName: inv.name,
      });
      for (const dep of includedDeps) {
        result.push({
          id: dep.id,
          name: dep.name,
          isDependent: true,
          primaryInviteeId: inv.id,
          primaryInviteeName: inv.name,
        });
      }
    }
  }
}
```

#### `GuestHierarchyTreeView.tsx`
```typescript
const totalCount = filteredInvitees.reduce((acc, inv) => {
  const deps = getVisibleDependents(inv);
  if (inv.guestType === 'FAMILY') {
    return acc + (deps.length > 0 ? deps.length : 1);
  }
  return acc + 1 + deps.length;
}, 0);
```

#### `CreatorCanvas.tsx`
```typescript
const depsCount = Math.max(state.guest.additionalGuests?.length || 0, state.guest.dependents?.length || 0);
const reservedSeats = state.guest.guestType === 'FAMILY'
  ? (depsCount > 0 ? depsCount : 1)
  : 1 + depsCount;
```

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Mismatch between Dashboard and Seating Plan | Both `DashboardStats` and `floorPlanUtils` use the identical rule: family parties seat their members rather than generating a ghost seat for the family title string. |
| Existing unit tests failing due to old $1 + N$ expectation for family entries | Update test suites in `DashboardStats.test.ts`, `floorPlanUtils.test.ts`, and `GuestHierarchyTreeView.test.tsx` to validate household container behavior. |
| Family with 0 members listed | Fallback to 1 ensures single placeholder invites are not calculated as 0 seats. |
