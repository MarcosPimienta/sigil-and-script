# Proposal — Persist and Load Invitation Configurations

## Problem
Currently, invitation custom design configurations (like layout, colors, text blocks, countdown, registry, and itinerary) are transient. They are neither saved in the database nor loadable by the host. There are no toolbar controls to save/load, no CRUD endpoints on the backend, and no columns in the SQLite database to house the full serialized layout design.

## Proposed Solution

1. **Database Schema Extension**:
   - Add a `designData` string column to the `InvitationCanvas` model in [schema.prisma](file:///home/fenix3819/sigil-and-script/server/prisma/schema.prisma).
   - This stores the full serialized `InvitationDesign` JSON string.

2. **Backend API Endpoints**:
   - Add routes in [invite.ts](file:///home/fenix3819/sigil-and-script/server/src/routes/invite.ts) and controller actions in [inviteController.ts](file:///home/fenix3819/sigil-and-script/server/src/controllers/inviteController.ts):
     - `GET /canvas`: Retrieve all configurations for listing.
     - `POST /canvas`: Create a new canvas configuration or update an existing one if the payload contains a valid UUID `id`.
     - `DELETE /canvas/:id`: Remove a configuration by ID.

3. **Frontend Store Actions**:
   - In [sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts), add:
     - `saveCurrentDesign()`: Calls the `POST /canvas` endpoint to persist the design.
     - `loadDesign(id)`: Fetches a design from the database and updates `state.design`.

4. **UI Integration**:
   - **Configurator Sidebar**: Update the sidebar header in [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx) to render a text input for `design.title` so the user can easily name/rename the invitation.
   - **Studio Toolbar**: In [Toolbar.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/Toolbar.tsx), add "Save Layout" and "Load Layout" buttons.
   - **Load Dialog (Modal)**: Implement a clean React dialog component inside `Toolbar.tsx` or `CreatorCanvas.tsx` to list all saved invitations, let the host load a selected layout, or delete obsolete records.

---

## Files to Modify

| File | Change |
|---|---|
| `server/prisma/schema.prisma` | Add `designData` property to `InvitationCanvas`. |
| `server/src/routes/invite.ts` | Register `GET /canvas`, `POST /canvas`, and `DELETE /canvas/:id` endpoints. |
| `server/src/controllers/inviteController.ts` | Implement controller actions: `getCanvases`, `saveCanvas`, and `deleteCanvas`. |
| `src/state/sigilStore.ts` | Add design store save, fetch list, and load actions. |
| `src/components/creator/LeftPanel.tsx` | Add an editable title input field to the panel header. |
| `src/components/creator/Toolbar.tsx` | Add Save and Load buttons, and implement the saved configurations overlay modal. |

---

## Scope Constraints

- **In-Scope**:
  - extending Prisma schemas and running local SQLite schema pushes.
  - Creating JSON-serialized configurations storage.
  - Adding CRUD endpoints for host configurations.
  - Integrating Save/Load buttons and list loading modal in the frontend.
- **Out-of-Scope**:
  - Implementing cookie or JWT authentication mechanisms (we will rely on headers and mock session host IDs).
  - Syncing guest roster lists between multiple distinct host canvases (each canvas keeps its own roster or uses default locally saved guest files).
