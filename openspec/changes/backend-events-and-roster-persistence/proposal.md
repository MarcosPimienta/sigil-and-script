# Proposal: Backend Events & Guest Roster Persistence Sync

## Problem
Currently, event invitations and guest rosters rely primarily on browser `localStorage`, leading to unpersisted events and empty backend database tables:
1. **Unsaved Event Creation**: When a user clicks "Create New Event" on the Events Hub (`EventsHubView.tsx`), it sets local state only and never invokes `saveCurrentDesign()` to persist the new canvas to the database.
2. **Missing Guest Roster Loading**: When an event is loaded via `loadDesign(id)`, the backend `getCanvasById` does not `include: { invitees: true }`, and `loadDesign` in `sigilStore.ts` does not hydrate `guestRoster` from backend DB records.
3. **Unsynced Guest Modifications**: Adding, removing, or batch-importing guests only updates `localStorage.getItem('sigil-guest-roster')`. Guest records are only pushed to Supabase if the user manually clicks "Save Layout" in the Toolbar.

As a result, Supabase `Guest` and `InvitationCanvas` tables remain empty or out-of-sync, and events/invitations do not persist across devices or browser sessions.

## Proposed Solution
1. **Automatic Event Persistence**: Update `handleCreateNew` in `EventsHubView.tsx` to automatically invoke `saveCurrentDesign()` upon event creation, ensuring the new invitation card immediately exists in the backend database.
2. **Hydrate Roster from Backend**: 
   - Update `getCanvasById` in `server/src/controllers/inviteController.ts` to `include: { invitees: true }`.
   - Update `loadDesign` in `src/state/sigilStore.ts` to populate `guestRoster` from the returned `canvas.invitees`.
3. **Auto-Sync Guest Roster Changes**:
   - Update roster store actions (`addInvitee`, `removeInvitee`, `updateInvitee`, `ingestGuestsBatch`, `addDependent`, `removeDependent`) to trigger backend persistence (`saveCurrentDesign()`) so guest additions and changes sync immediately to Supabase.

## Files to Create & Modify
| File Path | Description |
| --- | --- |
| `server/src/controllers/inviteController.ts` | Update `getCanvasById` to `include: { invitees: true }`. |
| `src/state/sigilStore.ts` | Update `loadDesign` to hydrate `guestRoster` from backend `canvas.invitees`, and trigger `saveCurrentDesign` on roster updates. |
| `src/components/events/EventsHubView.tsx` | Update `handleCreateNew` to call `saveCurrentDesign()` upon creation. |

## Scope Constraints
### In-Scope
- Server `getCanvasById` include `invitees`.
- Auto-save on event creation in `EventsHubView.tsx`.
- Roster hydration from backend on `loadDesign`.
- Roster change auto-sync to backend.

### Out-of-Scope
- Real-time multi-user collaborative editing via WebSockets.
