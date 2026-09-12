# Specification: Co-Host & Collaborator System

## Purpose
Allow event owners to invite co-hosts and editors to customize invitation designs, manage guest rosters, and organize seating together.

## Scenarios

### 1. Inviting a Collaborator
- **GIVEN** an authenticated owner of an `InvitationCanvas`
- **WHEN** they submit an email and role to `POST /canvas/:id/collaborators`
- **THEN** the system generates a unique 64-char crypto hex `inviteToken`
- **AND** creates a `CanvasCollaborator` record with `status: 'PENDING'`
- **AND** dispatches an invitation email containing the link `/?collab=<token>`.

### 2. Unauthorized Invitation Attempt
- **GIVEN** a user who is not the owner of the canvas
- **WHEN** they attempt `POST /canvas/:id/collaborators`
- **THEN** the server rejects the request with HTTP `403 Forbidden`.

### 3. Resolving Public Invite Details
- **GIVEN** an invite token
- **WHEN** a client calls `GET /collaborators/invite/:token`
- **THEN** the server returns `200` with the event title, event type, inviter name, and target email
- **OR** returns `404` with `"Invalid or expired invitation link"` if the token does not exist or is already accepted.

### 4. Claiming a Collaborator Invitation
- **GIVEN** an authenticated user accessing `/?collab=<token>`
- **WHEN** they click "Accept Invitation" (`POST /collaborators/invite/:token/accept`)
- **THEN** the server updates the `CanvasCollaborator` status to `'ACCEPTED'` and links `userId`
- **AND** the canvas appears in the user's `EventsHubView` with a "Co-Host" badge
- **AND** the collaborator can load and update the canvas via `GET /canvas/:id` and `POST /canvas`.

### 5. Deletion Protection
- **GIVEN** an accepted collaborator with role `CO_HOST` or `EDITOR`
- **WHEN** they attempt `DELETE /canvas/:id`
- **THEN** the server denies the request with HTTP `403 Forbidden` (only the original owner can delete an entire canvas).
