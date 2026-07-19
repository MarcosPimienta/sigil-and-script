# Technical Design: Backend Events & Guest Roster Persistence Sync

## Architectural Decisions

### Decision 1: Immediate Backend Event Creation (`handleCreateNew`)
- **Choice**: When clicking "Create New Event" in `EventsHubView.tsx`, reset defaults, assign a new UUID, and immediately invoke `await saveCurrentDesign()`.
- **Reasoning**: Ensures that a created event is immediately persisted to the backend database (`InvitationCanvas` table) and appears when returning to "My Event Invitations" or logging in from another device.

### Decision 2: Backend Roster Hydration (`getCanvasById` + `loadDesign`)
- **Choice**: Modify `getCanvasById` in `server/src/controllers/inviteController.ts` to include `invitees: true`.
- **Choice**: In `sigilStore.ts`'s `loadDesign(designId)`:
  - Extract `canvas.invitees` array.
  - Map Prisma `Guest` objects (`id`, `name`, `status`, `formResponses`) to `InviteeRecord` format (`id`, `name`, `email`, `status`, `dependents`, `openedAt`).
  - Set `guestRoster: { invitees: mappedInvitees }` in Zustand state and update `localStorage`.

### Decision 3: Auto-Persistence on Roster Mutations
- **Choice**: When `addInvitee`, `removeInvitee`, `updateInvitee`, `ingestGuestsBatch`, or dependent actions are dispatched, schedule/trigger `saveCurrentDesign()` so that roster changes sync asynchronously to the backend database.
- **Reasoning**: Eliminates reliance on manual Toolbar "Save" button clicks, ensuring host guest rosters are 100% saved in Supabase.

## Risks & Mitigations
- **Database Strain on Rapid Actions**: Debounce or trigger asynchronous `saveCurrentDesign()` background tasks for roster updates so quick typing does not overload the backend.
- **Parsing Invalid formResponses**: Safely parse `formResponses` JSON in `loadDesign` with `try/catch` fallbacks.
