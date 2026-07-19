# Implementation Tasks

## 1. Test Isolation Fix
- [x] 1.1 Remove global `prisma.guest.deleteMany()` and `prisma.invitationCanvas.deleteMany()` from `server/tests/invite.test.ts`.
- [x] 1.2 Track created test IDs and scope `afterAll` cleanup strictly to `createdGuestIds` and `createdCanvasIds`.

## 2. Controller Roster Sync Safeguards
- [x] 2.1 Update `saveCanvas` in `server/src/controllers/inviteController.ts` to guard `deleteMany` so empty `invitees` arrays do not wipe existing database guests.

## 3. Verification & Deployment Test
- [x] 3.1 Run server test suite `npm test` in `server/` to verify tests pass without deleting database records.
- [x] 3.2 Verify `server/package.json` scripts are safe for Vercel deployment.
