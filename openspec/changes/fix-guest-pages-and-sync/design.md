# Design: Guest Pages Text Color and Roster Backend Sync

This document outlines the design decisions and implementation details for syncing the guest roster to the backend and fixing the text colors in the guest RSVP form.

## Architectural Decisions

### 1. Dependents Serialization in `formResponses`
To avoid adding a new relational database table for `Dependent` (which would require database migrations, complex foreign keys, and additional query overhead), we will serialize the dependents list as a JSON array inside the existing `formResponses` text column of the `Guest` database model.
- **Format**:
  ```json
  {
    "dependents": [
      { "id": "uuid-1", "name": "Dependent Name", "included": true }
    ]
  }
  ```
- **Trade-off**: The database does not enforce integrity constraints on individual dependents, but since they are only managed via the creator application studio, serialization is simple, robust, and requires zero database migrations.

### 2. Transactional Roster Sync in `saveCanvas`
When the host saves the invitation canvas state via `POST /canvas`, they will transmit the full guest list roster as well.
The backend will:
1. Delete any `Guest` records currently associated with this canvas whose IDs are *not* present in the incoming `invitees` payload.
2. Upsert (create or update) all other `Guest` records from the incoming list, ensuring their names, statuses, and serialized dependents are preserved.
- **Trade-off**: Running this in a transaction block ensures canvas changes and guest roster updates succeed or fail together, ensuring data integrity.

### 3. Session-Based Toolbar Visibility
The top Toolbar will only render when:
- `appMode !== 'RECIPIENT'` OR
- `user` is logged in (signifying the host is previewing the invitation).
When a guest opens the invitation via `/invite/:token` without a login session (`!user`), the Toolbar is completely hidden to provide a clean, dedicated invitation page.

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Orphaned guests after canvas changes | All guest CRUD operations use `canvasId` reference, and deleting a canvas deletes all its associated guests via Prisma's `onDelete: Cascade` constraint. |
| Inability to seek details for guest from public client | The `/invite/:token` route is public, but it is gated by a UUID token which acts as a passwordless secure key. |
