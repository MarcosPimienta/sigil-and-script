# Tasks: Guest Pages Text Color and Roster Backend Sync

- [x] 1. Styles Override
  - [x] 1.1 Add styles override in `src/styles/creator.css` for `.envelope-letter-viewport-overlay.state-completed .left-panel` to use transparent background, no shadow, no border, and dark colors (`#333333` / `--rsvp-text-secondary`) for labels and input text fields.
- [x] 2. Guest Link Updates
  - [x] 2.1 Update `DashboardView.tsx` link generator to copy `/invite/${invitee.id}` instead of query parameters.
- [x] 3. Frontend Store Synchronization
  - [x] 3.1 Update `saveCurrentDesign` in `src/state/sigilStore.ts` to transmit the `invitees` roster to `/canvas`.
  - [x] 3.2 Update `fetchInvitationDetails` in `src/state/sigilStore.ts` to extract the guest name and dependents from database `formResponses`.
- [x] 4. Backend Database Sync
  - [x] 4.1 Update `saveCanvas` in `server/src/controllers/inviteController.ts` to sync the `invitees` roster: delete missing guests and upsert active guests, serializing dependents into `formResponses`.
- [x] 5. Navigation Toolbar Cleanup
  - [x] 5.1 Hide the `header` container in `src/components/creator/Toolbar.tsx` when `isRecipient` is true and no `user` is logged in.
- [x] 6. Verification
  - [x] 6.1 Confirm unit tests (`npm run test`) pass.
  - [x] 6.2 Confirm compilation build (`npm run build`).
