# Technical Design: Count and Display Dependents Breakdown

## Architectural Decisions

1. **`computeStats` Data Model Update**:
   ```typescript
   export function computeStats(invitees: InviteeRecord[]) {
     const getGuestCount = (i: InviteeRecord) => 1 + (i.dependents?.length || 0);
     const totalDependents = invitees.reduce((acc, i) => acc + (i.dependents?.length || 0), 0);

     return {
       total:      invitees.reduce((acc, i) => acc + getGuestCount(i), 0),
       dependents: totalDependents,
       attending:  invitees.filter((i) => i.status === 'RSVP_YES').reduce((acc, i) => acc + getGuestCount(i), 0),
       declined:   invitees.filter((i) => i.status === 'RSVP_NO').reduce((acc, i) => acc + getGuestCount(i), 0),
       opened:     invitees.filter((i) => i.status === 'OPENED').reduce((acc, i) => acc + getGuestCount(i), 0),
       sent:       invitees.filter((i) => i.status === 'SENT').reduce((acc, i) => acc + getGuestCount(i), 0),
       pending:    invitees.filter((i) => i.status === 'PENDING').reduce((acc, i) => acc + getGuestCount(i), 0),
     };
   }
   ```

2. **Roster Heading Breakdown**:
   - `totalDependents = invitees.reduce((acc, i) => acc + (i.dependents?.length || 0), 0)`
   - `primaryCount = invitees.length`
   - Render: `Guests ({primaryCount + totalDependents}) ({primaryCount} primary, {totalDependents} dependents)`
