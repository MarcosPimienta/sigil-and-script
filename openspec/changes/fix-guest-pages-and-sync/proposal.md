# Proposal: Guest Pages Text Color and Roster Backend Sync

## Problem
1. **White RSVP Text**: The guest RSVP form has white text and labels, making it completely invisible on the light parchment background.
2. **Local-Only Guest Links**: The guest links generated from the dashboard use `?guest=id` query parameters, which are only hydrated from local storage. When a real guest opens the link on their device, their local storage is empty, so they are redirected to log in / edit instead of seeing their customized invitation.
3. **No Database Roster Synchronization**: The guest list roster created by the host is stored solely in local storage and never synchronized to the backend database. As a result, the backend `Guest` table remains empty, preventing passwordless `/invite/:token` routing from resolving correctly.
4. **Editor Toolbar Exposed to Guests**: The editor navigation header (Toolbar) remains visible to guests, allowing them to see internal designer options.

## Proposed Solution
- **CSS Color Fix**: Override RSVP inputs, selects, and labels when inside the parchment overlay to use dark text (`#333333`) and a clean transparent container background.
- **Dynamic Routing Links**: Modify the dashboard copy button to generate paths under `/invite/${invitee.id}`.
- **Frontend/Backend Synchronization**:
  - Update `saveCurrentDesign` in frontend to include the `invitees` roster.
  - Update `saveCanvas` in the backend to sync guests with database records using a Prisma transaction, serializing their dependents into `formResponses` JSON.
  - Update `fetchInvitationDetails` in frontend to read and populate dependents list from backend responses.
- **Immersive Guest View**: Hide the `Toolbar` top navigation header if the user is in recipient mode and is not a logged-in host.

## Files to Modify

| File Path | Change |
| --- | --- |
| `src/styles/creator.css` | Override RSVP inputs, labels, and text colors inside the parchment paper details wrapper. |
| `src/components/dashboard/DashboardView.tsx` | Redesign the copy button to generate link paths under `/invite/${invitee.id}`. |
| `src/state/sigilStore.ts` | Sync guest roster during save, and parse dependents during invitation details load. |
| `server/src/controllers/inviteController.ts` | Process the `invitees` array inside `saveCanvas` and sync it to the `Guest` database table. |
| `src/components/creator/Toolbar.tsx` | Hide the toolbar wrapper for guests when not previewing as a host. |

## Scope Constraints
- **In-Scope**:
  - Fixing visual visibility of labels/inputs in guest RSVP panel.
  - Syncing local guest roster data to backend database on canvas save.
  - Resolving custom guest names and dependents from DB in client view.
  - Hiding editor toolbar for actual guests.
- **Out-of-Scope**:
  - Creating new database tables (dependents list is stored as serialized JSON inside existing `formResponses` field).
  - Syncing guest list automatically without clicking "Save Layout" (triggered on layout save).
