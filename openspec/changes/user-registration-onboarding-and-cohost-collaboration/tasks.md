# Tasks: User Registration Onboarding & Co-Host Collaboration

**Change ID:** `user-registration-onboarding-and-cohost-collaboration`  
**Created:** 2026-09-12  

## 1. Database Schema & Prisma Migration

- [x] 1.1 Update `server/prisma/schema.prisma` with the `CanvasCollaborator` model, including relations to `InvitationCanvas` (with `onDelete: Cascade`) and `User` (with `onDelete: SetNull`).
- [x] 1.2 Run `npm --prefix server run db:generate` and `npm --prefix server run db:push` to apply the migration.
- [x] 1.3 Update `server/scripts/enable-rls.js` if necessary to maintain RLS security on PostgreSQL.

## 2. Backend Collaborator Services & API Endpoints

- [x] 2.1 Create `server/src/controllers/collaboratorController.ts` with handlers:
  - `inviteCollaborator`: validates owner permissions, checks existing invites, generates token, sends email via `mailer.ts`.
  - `listCollaborators`: returns active and pending collaborators for a canvas.
  - `removeCollaborator`: owner removes a collaborator or collaborator removes themselves.
  - `getInviteDetails`: public endpoint returning event title and inviter info for a valid token.
  - `acceptInvite`: claims an invite for the authenticated session user.
- [x] 2.2 Register collaborator routes in `server/src/routes/invite.ts` under:
  - `POST /canvas/:id/collaborators`
  - `GET /canvas/:id/collaborators`
  - `DELETE /canvas/:id/collaborators/:collabId`
  - `GET /collaborators/invite/:token`
  - `POST /collaborators/invite/:token/accept`
- [x] 2.3 Modify `server/src/controllers/inviteController.ts`:
  - Update `getCanvases` to include events where the caller is an accepted collaborator.
  - Update `getCanvasById` and `saveCanvas` to permit accepted collaborators with role `CO_HOST` or `EDITOR`.
  - Ensure `deleteCanvas` is strictly restricted to the original owner.
- [x] 2.4 Create `server/tests/collaborator.test.ts` to verify the entire lifecycle:
  - Owner can invite by email.
  - Non-owner cannot invite collaborators (403).
  - Public invite details endpoint returns correct event metadata.
  - User can accept invite and gain edit access to the canvas.
  - Owner can revoke invite or remove collaborator.
  - Collaborator cannot delete the canvas (403).

## 3. Frontend Types & Zustand Store Actions

- [x] 3.1 Update `src/types/sigil.types.ts`:
  - Add `CollaboratorRole` (`'CO_HOST' | 'EDITOR' | 'VIEWER'`).
  - Add `CanvasCollaborator` interface (`id`, `canvasId`, `email`, `role`, `status`, `userId`, `createdAt`).
  - Add `CollaboratorInviteDetails` interface.
- [x] 3.2 Add collaborator actions in `src/state/sigilStore.ts`:
  - `fetchCollaborators: (canvasId: string) => Promise<CanvasCollaborator[]>`
  - `inviteCollaborator: (canvasId: string, email: string, role?: CollaboratorRole) => Promise<{ success: boolean; inviteLink?: string }>`
  - `removeCollaborator: (canvasId: string, collabId: string) => Promise<boolean>`
  - `getCollaboratorInviteDetails: (token: string) => Promise<CollaboratorInviteDetails | null>`
  - `acceptCollaboratorInvite: (token: string) => Promise<string | null>`
- [x] 3.3 Ensure `fetchSavedDesigns` in `sigilStore.ts` reflects co-hosted events with a `isCoHost: boolean` flag.

## 4. Public Landing Hero & Visual Presentation

- [x] 4.1 Create `src/styles/landing.css` with dark luxury palette (`#151413` background, `#dfb88e` gold accents, glassmorphic cards).
- [x] 4.2 Create `src/components/landing/LandingHero.tsx`:
  - Hero header with Sigil & Script brand, "Sign In" button, and "Start Designing" CTA.
  - Headline and value proposition for interactive invitations.
  - Interactive template preview carousel (Wedding, Birthday, Baptism, Corporate, Custom).
  - Feature highlights (wax seals, typography, guest hierarchy, table seating blueprints).
  - Primary call-to-action launching the Onboarding Wizard.

## 5. Guided Host Onboarding Wizard

- [x] 5.1 Create `src/components/onboarding/OnboardingWizard.tsx`:
  - Step 1: Account registration (Name, Email, Password $\ge 12$ chars, Confirm Password) with real-time validation and auto-login.
  - Step 2: Event type picker (Wedding, Birthday, Baptism, Corporate, Custom) and language selector (`ES` / `EN`).
  - Step 3: Event title and target date.
  - Submission handler: creates canvas, persists to backend, sets `appMode = 'CREATOR'`, and transitions directly into the studio.
- [x] 5.2 Add welcome notification toast on studio canvas mount when entering from onboarding wizard.

## 6. Co-Host Management & Acceptance Flow

- [x] 6.1 Create `src/styles/collaborator.css` for modal layout, collaborator chips, and invitation cards.
- [x] 6.2 Create `src/components/collaborators/CollaboratorModal.tsx`:
  - Active and pending collaborator list with roles and remove actions.
  - Email invitation form with role dropdown and "Send Invitation" button.
  - "Copy Invite Link" utility for manual sharing.
- [x] 6.3 Create `src/components/collaborators/CollaboratorInviteView.tsx`:
  - Renders invitation card: *"You've been invited by [Inviter] to co-host [Event Title]"*.
  - Offers "Accept & Open Studio" button if user is already signed in.
  - Offers seamless registration/login tab if user is unauthenticated, auto-accepting upon auth completion.
- [x] 6.4 Update `src/components/creator/Toolbar.tsx`:
  - Add "Co-Hosts" button opening `CollaboratorModal`.
- [x] 6.5 Update `src/components/events/EventsHubView.tsx`:
  - Render "Co-Host" badge on shared event cards.
  - Add "Share / Co-hosts" action icon to the event card footer.
- [x] 6.6 Update `src/App.tsx`:
  - Route `/?collab=<token>` directly to `CollaboratorInviteView`.
  - Route unauthenticated root `/` to `LandingHero` by default, with toggles for `OnboardingWizard` and `LoginView`.
  - Handle `/?auth=register` and `/?auth=login` query parameters.

## 7. Verification & Automated Tests

- [x] 7.1 Run backend tests with `npm run test:server` and verify all tests pass (43/43 tests pass, including collaborator lifecycle & security tests).
- [x] 7.2 Run frontend tests with `npm run test` and verify all tests pass (258/258 tests pass across all 38 test files).
- [x] 7.3 Run linter and type-checker with `npm run lint` and `npm run build` (both Vite client bundle and server tsc build clean with 0 errors).
- [x] 7.4 End-to-end component walkthrough & unit verification:
  - Validated `LandingHero` rendering, tab switching, and modal opening via `LandingHero.test.tsx`.
  - Validated 3-step `OnboardingWizard` form validations, auto-login, and canvas initialization via `OnboardingWizard.test.tsx`.
  - Validated `CollaboratorModal` invite sending and collaborator management via `CollaboratorModal.test.tsx`.
  - Validated API collaborator invitation, token verification, and co-host scoped authorization via `server/tests/collaborator.test.ts`.

