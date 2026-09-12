# Technical Design: User Registration Onboarding & Co-Host Collaboration

**Change ID:** `user-registration-onboarding-and-cohost-collaboration`  
**Created:** 2026-09-12  

## 1. Architectural Overview

This change addresses both top-of-funnel acquisition (turning curious visitors into registered hosts designing their first event) and collaborative event execution (enabling multiple hosts to design and manage an event together).

```
                ┌─────────────────────────────────────────────────────────┐
                │                      Public Entry                       │
                └───────────────────────────┬─────────────────────────────┘
                                            │
                   ┌────────────────────────┴────────────────────────┐
                   │                                                 │
          [Normal Visitor]                                 [/?collab=TOKEN]
                   │                                                 │
                   ▼                                                 ▼
        ┌─────────────────────┐                         ┌─────────────────────────┐
        │   LandingHero.tsx   │                         │ CollaboratorInviteView  │
        └──────────┬──────────┘                         └────────────┬────────────┘
                   │                                                 │
      ┌────────────┴────────────┐                       ┌────────────┴────────────┐
      ▼                         ▼                       ▼                         ▼
 [Sign In]              [Start Designing]          [Log In & Claim]      [Register & Claim]
      │                         │                       │                         │
      ▼                         ▼                       └────────────┬────────────┘
┌───────────┐         ┌───────────────────┐                          │
│ LoginView │         │ OnboardingWizard  │                          │
└─────┬─────┘         └─────────┬─────────┘                          │
      │                         │                                    │
      ▼                         ▼                                    ▼
┌───────────┐         ┌───────────────────┐             ┌─────────────────────────┐
│ EventsHub │         │   CreatorCanvas   │◄────────────┤  Shared Canvas Access   │
└───────────┘         └───────────────────┘             └─────────────────────────┘
```

---

## 2. Data Model & Database Architecture

### Prisma Schema (`server/prisma/schema.prisma`)

```prisma
model CanvasCollaborator {
  id          String           @id @default(uuid())
  canvasId    String
  canvas      InvitationCanvas @relation(fields: [canvasId], references: [id], onDelete: Cascade)
  userId      String?
  user        User?            @relation(fields: [userId], references: [id], onDelete: SetNull)
  email       String
  role        String           @default("CO_HOST") // CO_HOST | EDITOR | VIEWER
  status      String           @default("PENDING") // PENDING | ACCEPTED
  inviteToken String           @unique
  createdAt   DateTime         @default(now())
  acceptedAt  DateTime?

  @@index([canvasId, email])
  @@index([userId])
}
```

#### Schema Relations:
- **`InvitationCanvas`**: Gains `collaborators CanvasCollaborator[]`. Cascade deletion on `InvitationCanvas` automatically cleans up all associated collaborator records.
- **`User`**: Gains `collaborations CanvasCollaborator[]`. If a user account is deleted, collaborator records retain the invited email while setting `userId` to `null`.

---

## 3. Backend API Specifications

### 1. `POST /canvas/:id/collaborators`
- **Auth**: `requireAuth`
- **Validation**:
  - Request body: `{ email: string, role?: 'CO_HOST' | 'EDITOR' }`
  - Validates that caller is the canvas owner (`existing.userId === req.user.id`).
  - Validates email format.
  - Prevents inviting oneself (`email.toLowerCase() === req.user.email.toLowerCase()`).
  - Checks if active or pending invite already exists for this canvas and email.
- **Actions**:
  - Generates 64-char crypto hex `inviteToken`.
  - Creates `CanvasCollaborator` with `status: 'PENDING'`.
  - Sends email via `services/mailer.ts` with link `${appUrl()}/?collab=${inviteToken}` and message details.
- **Response**: `201 { success: true, collaborator: CanvasCollaborator }`

### 2. `GET /canvas/:id/collaborators`
- **Auth**: `requireAuth`
- **Permission**: Allowed if user is the canvas owner OR an accepted collaborator.
- **Response**: `200 { collaborators: CanvasCollaborator[] }`

### 3. `DELETE /canvas/:id/collaborators/:collabId`
- **Auth**: `requireAuth`
- **Permission**: Allowed if user is the canvas owner (can remove anyone) OR if the caller is the collaborator themselves (leaving the event).
- **Response**: `200 { success: true }`

### 4. `GET /collaborators/invite/:token`
- **Auth**: None (Public)
- **Rate Limit**: Rate-limited via token validation limiter.
- **Actions**:
  - Validates token exists and status is `PENDING`.
  - Loads associated canvas `id`, `designData.title`, `eventType`, and inviter's name/email.
- **Response**: `200 { valid: true, eventTitle: string, eventType: string, inviterName: string, email: string, role: string }`

### 5. `POST /collaborators/invite/:token/accept`
- **Auth**: `requireAuth`
- **Actions**:
  - Validates token.
  - Verifies user's email matches the invited email (case-insensitive) OR automatically claims for the authenticated user.
  - Updates `CanvasCollaborator` record: `userId = req.user.id`, `status = 'ACCEPTED'`, `acceptedAt = now()`.
- **Response**: `200 { success: true, canvasId: string }`

---

## 4. Authorization Extension in `inviteController.ts`

1. **`getCanvases`**:
   ```ts
   const canvases = await prisma.invitationCanvas.findMany({
     where: {
       OR: [
         { userId: req.user.id },
         {
           collaborators: {
             some: {
               userId: req.user.id,
               status: 'ACCEPTED',
             },
           },
         },
       ],
     },
     include: {
       collaborators: {
         where: { userId: req.user.id },
         select: { role: true, status: true },
       },
     },
   });
   ```
2. **`getCanvasById`**:
   - Permits access if `canvas.userId === req.user.id` OR user is an accepted collaborator.
3. **`saveCanvas`**:
   - Permits updates if `canvas.userId === req.user.id` OR user is an accepted collaborator with role `CO_HOST` or `EDITOR`.
4. **`deleteCanvas`**:
   - Strictly restricted to `canvas.userId === req.user.id` (only the owner may delete an entire canvas).

---

## 5. Frontend Component Specifications

### 1. `LandingHero.tsx`
- **Theme**: Dark luxury parchment, deep charcoal backgrounds (`#151413` to `#232221`), gold typography (`#dfb88e`), serif headings (`Cormorant Garamond`).
- **Sections**:
  - **Header Bar**: Wordmark "Sigil & Script", "Sign In" button, "Start Designing" CTA.
  - **Hero Banner**: Headline *"Handcrafted Digital Invitations with Timeless Elegance"*, subheadline explaining dynamic seals, typography, itineraries, and seating charts.
  - **Interactive Showcase**: Live preview of invitation cards across celebration types (Wedding, Gala, Birthday, Baptism, Corporate).
  - **Feature Grid**: Wax seal relief engine, guest hierarchy tree & RSVP telemetry, table seating blueprints.
  - **Action Footer**: "Create Your First Invitation" opening `OnboardingWizard`.

### 2. `OnboardingWizard.tsx`
- **Modal Overlay with 3 Steps**:
  - **Step 1: Account**: Full Name, Email, Password ($\ge 12$ chars), Confirm Password. Submits to `/auth/register` and auto-logs in.
  - **Step 2: Template**: Select celebration type (Wedding, Birthday, Baptism, Corporate, Custom) and language (English / Spanish).
  - **Step 3: Event Essentials**: Event Title (e.g., "Elena & Marcus", "Annual Technology Gala"), countdown date.
- **Completion**:
  - Auto-initializes canvas using `createDesignFromTemplate(eventType, lang)`.
  - Sets title and target date.
  - Saves canvas to backend via `saveCurrentDesign()`.
  - Redirects user into `CreatorCanvas` (`appMode = 'CREATOR'`) with a welcome toast: *"Welcome to your Studio! Start customizing your invitation."*

### 3. `CollaboratorModal.tsx`
- Opened from `Toolbar` or `EventsHubView`.
- Displays:
  - List of active collaborators and their status (Owner, Co-Host, Pending invite).
  - Invite form: Email input, Role dropdown (`CO_HOST`, `EDITOR`), "Send Invitation" button.
  - Copyable invitation link for direct sharing if email delivery is delayed.
  - Action to revoke pending invitations or remove collaborators.

### 4. `CollaboratorInviteView.tsx`
- Triggered when URL has `/?collab=<token>`.
- Calls `/collaborators/invite/:token` on mount to fetch event title and inviter name.
- Renders card:
  - *"You've been invited by [Inviter] to co-host [Event Title]"*.
  - If authenticated: **"Accept Invitation & Open Studio"** button.
  - If unauthenticated: Compact register or sign-in tab that completes registration and immediately claims the invite.

---

## 6. Risks & Mitigations

| Risk | Potential Impact | Mitigation |
| :--- | :--- | :--- |
| **Email spoofing / Unauthorized invite claim** | A user claiming an invite token intended for someone else. | Each invite token is 64 cryptographically secure random hex bytes (`crypto.randomBytes(32)`). Tokens are single-use (`status: 'ACCEPTED'`). Additionally, invitation emails state the intended recipient. |
| **Simultaneous saves by Co-Hosts** | Last write overwriting previous changes. | For v1, updates persist the full design JSON. Both hosts have live save buttons and notifications. A future milestone can add optimistic concurrency timestamps or field-level CRDTs. |
| **Owner deletion leaving orphaned collaborators** | Foreign key errors or inaccessible events. | `onDelete: Cascade` on `CanvasCollaborator.canvasId` ensures all collaborator records are automatically purged when the canvas is deleted. |
| **Regression in guest invitation links (`/invite/:token`)** | Recipient guest experience disrupted. | Collaborator invites use `/?collab=<token>` while guest links continue using `/invite/:token`. Clear separation prevents routing collisions. |
