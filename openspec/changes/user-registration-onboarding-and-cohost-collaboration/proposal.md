# Proposal: User Registration Onboarding & Co-Host Collaboration

**Change ID:** `user-registration-onboarding-and-cohost-collaboration`  
**Created:** 2026-09-12  
**Status:** Awaiting approval  

## Problem

Sigil & Script has a functional backend authentication system (`POST /auth/register`, `POST /auth/login`, password recovery) and an event creator studio. However, two critical hurdles prevent real users and teams from adopting the platform:

1. **Cold & Intimidating First-Time User Experience**:
   - When prospective hosts visit the application at `/`, they are immediately confronted by a bare sign-in form (`LoginView`) with no explanation of what Sigil & Script does.
   - Registration is hidden behind a subtle text link ("Don't have an account? Create Account").
   - Upon registering, a new host is dumped into an empty Events Hub (`EventsHubView`) without direction, forcing them to find the `+` button and manually configure their first event.
2. **Single-User Event Silo (No Co-Host Collaboration)**:
   - Events (weddings, galas, birthdays, corporate summits) are almost never planned alone. Couples, co-organizers, planners, and vendors must collaborate.
   - Currently, each `InvitationCanvas` is strictly isolated to a single `userId` (`hostId`). There is no mechanism to share access with a partner or co-host.
   - There is no invitation flow for an existing host to invite someone to co-edit an invitation, nor an onboarding link where an invited co-host can register and immediately collaborate on that specific event.

## Proposed Solution

Deliver an integrated host acquisition and collaboration system spanning two complementary modules:

### Module 1: Public Landing Hero & Guided Onboarding Wizard
- **Public Landing Hero (`LandingHero.tsx`)**:
  - Replaces the bare login box for unauthenticated visitors visiting `/`.
  - Showcases the elegance of Sigil & Script: interactive invitation preview, highlights of procedural wax seals, guest hierarchy trees, RSVP telemetry, and table seating blueprints.
  - Prominent primary CTA: **"Start Designing"** (launches the Onboarding Wizard) and secondary CTA **"Sign In"** (opens `LoginView`).
  - Supports direct query routing (`/?auth=register`, `/?auth=login`).
- **Guided Onboarding Wizard (`OnboardingWizard.tsx`)**:
  - A streamlined 3-step progressive modal for new hosts:
    1. **Step 1: Account Creation** (Name, Email, Password $\ge 12$ chars, Confirm Password) — automatically submits to `/auth/register` and performs auto-login.
    2. **Step 2: Celebration Type & Language** (Wedding, Birthday, Baptism, Corporate, Custom + English / Spanish).
    3. **Step 3: Celebration Details** (Event Title / Honorees' Names, target countdown date).
  - Immediately initializes the template canvas, persists it to the backend via `POST /canvas`, and seamlessly lands the host inside `CreatorCanvas` with their freshly created event ready to customize.

### Module 2: Co-Host & Collaborator System
- **Database Model (`CanvasCollaborator`)**:
  - Many-to-many relationship linking `InvitationCanvas` with invited emails, role (`CO_HOST` | `EDITOR`), status (`PENDING` | `ACCEPTED`), secure crypto `inviteToken`, and linked `userId`.
- **Collaborator API Endpoints**:
  - `POST /canvas/:id/collaborators`: Event owner invites a partner/collaborator by email. Sends invitation email with a secure link (`/?collab=<token>`) using `services/mailer.ts`.
  - `GET /canvas/:id/collaborators`: Retrieves all active and pending collaborators for the canvas.
  - `DELETE /canvas/:id/collaborators/:collabId`: Allows the owner to revoke an invitation or remove a collaborator.
  - `GET /collaborators/invite/:token`: Public endpoint returning event title, inviter name, and role for token verification.
  - `POST /collaborators/invite/:token/accept`: Authenticated endpoint that claims the invitation and links the user's `userId`.
- **Authorization & Access Expansion**:
  - Update `getCanvases`: Returns both owned events and events where the host is an accepted collaborator.
  - Update `getCanvasById` and `saveCanvas`: Allows authorized collaborators with `CO_HOST` or `EDITOR` role to view and save changes.
  - Restrict `deleteCanvas` strictly to the original canvas owner.
- **Collaborator UI**:
  - **In-App Management (`CollaboratorModal.tsx`)**: Accessible via a new **"Co-Hosts / Share"** button in `Toolbar` and `EventsHubView`. Displays the collaborator roster, pending invites, and an invitation form.
  - **Acceptance View (`CollaboratorInviteView.tsx`)**: Activated when a user visits `/?collab=<token>`. Displays an invitation banner (*"You've been invited by [Host] to co-host [Event]"*) with an integrated one-click registration or login form that claims the event immediately upon authentication.

## Files to Create & Modify

| File Path | Status | Purpose |
| :--- | :--- | :--- |
| `server/prisma/schema.prisma` | Modify | Add `CanvasCollaborator` model and relations to `InvitationCanvas` and `User`. |
| `server/src/controllers/collaboratorController.ts` | Create | Handlers for inviting, listing, revoking, resolving, and accepting collaborator invitations. |
| `server/src/controllers/inviteController.ts` | Modify | Expand `getCanvases`, `getCanvasById`, and `saveCanvas` to permit accepted collaborators. |
| `server/src/routes/invite.ts` | Modify | Register collaborator endpoints. |
| `server/tests/collaborator.test.ts` | Create | Backend integration test suite verifying collaborator invitations, email dispatch, acceptance, and authorization guards. |
| `src/types/sigil.types.ts` | Modify | Define `CanvasCollaborator`, `CollaboratorRole`, and `CollaboratorInviteDetails` interfaces. |
| `src/state/sigilStore.ts` | Modify | Add store actions for fetching, inviting, revoking, validating, and accepting co-host collaborations. |
| `src/components/landing/LandingHero.tsx` | Create | Premium public landing presentation for unauthenticated visitors. |
| `src/components/onboarding/OnboardingWizard.tsx` | Create | 3-step progressive onboarding wizard linking signup directly to event customization. |
| `src/components/collaborators/CollaboratorModal.tsx` | Create | Host modal to view active co-hosts and invite new collaborators by email. |
| `src/components/collaborators/CollaboratorInviteView.tsx` | Create | Recipient acceptance view for `/?collab=<token>` with automated invite claiming. |
| `src/components/creator/Toolbar.tsx` | Modify | Add "Co-Hosts" button in studio and dashboard modes. |
| `src/components/events/EventsHubView.tsx` | Modify | Add "Co-Host" badges to shared event cards and quick-share action. |
| `src/App.tsx` | Modify | Route between LandingHero, OnboardingWizard, CollaboratorInviteView, and auth views. |
| `src/styles/landing.css` | Create | Visual styling for public landing hero and onboarding wizard. |
| `src/styles/collaborator.css` | Create | Visual styling for collaborator modal, role badges, and invitation cards. |

## Scope Constraints

- **In-Scope**:
  - Public marketing hero at `/` for unauthenticated visitors with live sample invitation preview.
  - 3-step creation wizard for new hosts leading straight into the studio.
  - Database persistence for collaborators with cascade cleanup on canvas deletion.
  - Email notification dispatch with invitation link via Resend (`services/mailer.ts`).
  - Scoped multi-host permissions (owners and co-hosts can customize).
  - Front-end co-host invitation modal and invite token acceptance workflow.
  - Automated tests covering the entire backend collaborator lifecycle.
- **Out-of-Scope**:
  - Real-time WebSocket CRDT cursor synchronization (concurrent edits follow standard async save / last-write-wins for v1).
  - Third-party social OAuth (Google/Apple login).
  - Granular permissions per section (all co-hosts have full editor permissions on the event).
