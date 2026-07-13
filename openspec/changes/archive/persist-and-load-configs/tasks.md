## 1. Update Database Schema
- [x] 1.1 Add `designData String @default("{}")` to `InvitationCanvas` in [schema.prisma](file:///home/fenix3819/sigil-and-script/server/prisma/schema.prisma#L10).
- [x] 1.2 Run database schema update using `npm run db:push` in the `server` directory.

## 2. Implement Backend CRUD Routes
- [x] 2.1 Register canvas routes (`GET /canvas`, `POST /canvas`, and `DELETE /canvas/:id`) in [invite.ts](file:///home/fenix3819/sigil-and-script/server/src/routes/invite.ts#L5).
- [x] 2.2 Implement controller actions `getCanvases`, `saveCanvas`, and `deleteCanvas` in [inviteController.ts](file:///home/fenix3819/sigil-and-script/server/src/controllers/inviteController.ts#L4).

## 3. Implement Frontend Store Actions
- [x] 3.1 Add `saveCurrentDesign` and `loadDesign` state actions in [sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts#L90).

## 4. Integrate Editable Title in LeftPanel
- [x] 4.1 Update [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx#L158) header to show a text input for editing `design.title`.

## 5. Implement Toolbar Actions and SavedConfigurationsModal
- [x] 5.1 Add Save and Load action buttons in [Toolbar.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/Toolbar.tsx#L38).
- [x] 5.2 Build the `SavedConfigurationsModal` React overlay panel inside [Toolbar.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/Toolbar.tsx#L9) to list, load, and delete configurations.

## 6. Verification
- [x] 6.1 Run backend tests with `npm test` inside the `server` directory.
- [x] 6.2 Run client unit tests with `npm run test` inside the root workspace.
- [x] 6.3 Run `npm run build` in root workspace to confirm compiling.
