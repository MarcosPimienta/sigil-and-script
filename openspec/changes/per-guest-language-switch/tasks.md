# Tasks: Per-Guest Language Switch in Guest Roster

## Phase 1: Types & Schema Update
- [x] 1.1 Add `language?: 'ES' | 'EN'` to `InviteeRecord` and `GuestPayload` in `src/types/sigil.types.ts`.
- [x] 1.2 Update Prisma `Guest` model in `server/prisma/schema.prisma` with `language String @default("ES")`. Run `npx prisma db push` or migration.

## Phase 2: Frontend State & Component Integration
- [x] 2.1 Update `SigilContext` / reducer to support updating guest `language` field via `updateInvitee`.
- [x] 2.2 Add `[ ES | EN ]` segmented language switch toggle to `src/components/creator/InviteeRow.tsx`.
- [x] 2.3 Style the language switch in `src/styles/creator.css` / `tokens.css`.

## Phase 3: Backend & Serverless Controller Integration
- [x] 3.1 Update `server/src/controllers/inviteController.ts` to read `guest.language` with fallback to `canvas.designData.language`.
- [x] 3.2 Update `api/invite.js` to process `guest.language`.

## Phase 4: Automated Verification
- [x] 4.1 Write/update unit tests in `src/components/creator/InviteeRow.test.tsx` to verify language toggle state dispatch.
- [x] 4.2 Run unit tests and backend invite endpoint tests to ensure clean execution.
