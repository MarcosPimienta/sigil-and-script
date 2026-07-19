# Implementation Tasks

## 1. Backend Canvas Controller Updates
- [x] 1.1 Update `getCanvasById` in `server/src/controllers/inviteController.ts` to `include: { invitees: true }`.

## 2. Store Roster Hydration & Auto-Save
- [x] 2.1 Update `loadDesign` in `src/state/sigilStore.ts` to map `canvas.invitees` into `guestRoster`.
- [x] 2.2 Update `addInvitee`, `removeInvitee`, `updateInvitee`, `ingestGuestsBatch`, and dependent actions in `src/state/sigilStore.ts` to auto-trigger backend save.

## 3. Immediate Event Creation
- [x] 3.1 Update `handleCreateNew` in `src/components/events/EventsHubView.tsx` to automatically invoke `saveCurrentDesign()` upon creating a new event.

## 4. Verification & Testing
- [x] 4.1 Run unit tests (`npm test` in frontend and server) to ensure zero regressions.
- [x] 4.2 Verify event creation and guest additions persist to Supabase database.
