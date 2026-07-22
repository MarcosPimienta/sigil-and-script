# Technical Design: Include Dependents in Guest Count Calculations

## Architectural Decisions

1. **Passes Count Formula**:
   - `getGuestPassesCount(guest)`:
     ```typescript
     const depCount = Math.max(
       guest.additionalGuests?.length || 0,
       guest.dependents?.length || 0
     );
     return 1 + depCount;
     ```

2. **Dashboard Stats Computation**:
   - For an array of `InviteeRecord[]`:
     ```typescript
     const total = invitees.reduce((acc, i) => acc + 1 + (i.dependents?.length || 0), 0);
     ```
   - Categorized stats (`attending`, `declined`, `opened`, `sent`, `pending`) sum `1 + (i.dependents?.length || 0)` for invitees belonging to each category.

3. **Roster Heading**:
   - Total count displayed: `Guests (${totalGuests})` where `totalGuests = invitees.reduce((acc, i) => acc + 1 + (i.dependents?.length || 0), 0)`.
