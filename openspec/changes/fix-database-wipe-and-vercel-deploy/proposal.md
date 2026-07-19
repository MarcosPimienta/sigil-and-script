# Proposal: Fix Database Record Wiping & Secure Vercel Deployment

## Problem
Deploying or running tests against the server database causes all existing `Guest` and `InvitationCanvas` records to be completely erased.
1. **Destructive Unit Test Setup**: `server/tests/invite.test.ts` executes `await prisma.guest.deleteMany()` and `await prisma.invitationCanvas.deleteMany()` in `beforeAll` and `afterAll`. Whenever tests run (or when `vitest` runs during dev/build scripts), it wipes all production/staging database records.
2. **Unscoped Guest Deletion in Controller**: In `server/src/controllers/inviteController.ts`, `saveCanvas` executes `tx.guest.deleteMany({ where: { canvasId, id: { notIn: activeGuestIds } } })`. If `invitees` is sent as an empty array `[]`, it deletes all existing guests for that canvas.
3. **Vercel Build Script Configuration**: In `server/package.json`, `"dev"` script runs `vitest --run`. If Vercel or local deployment triggers test runs against the production `DATABASE_URL`, all database data is erased.

## Proposed Solution
1. **Safe Test Data Isolation**: Modify `server/tests/invite.test.ts` to only delete the specific test records created by that test suite (`id: { in: testCreatedIds }`), completely removing all global `deleteMany()` calls.
2. **Guarded Roster Sync in Controller**: Update `saveCanvas` in `server/src/controllers/inviteController.ts` to only perform guest deletion when `invitees` is explicitly passed and `activeGuestIds.length > 0`, protecting existing guest rosters from accidental wiping.
3. **Safe Build Scripts**: Ensure `server/package.json` scripts (`build`, `postinstall`) only run safe compilation and Prisma client generation (`prisma generate` and `tsc`), without running destructive test suites during Vercel deployment.

## Files to Create & Modify
| File Path | Description |
| --- | --- |
| `server/tests/invite.test.ts` | Remove global `deleteMany()` calls; isolate test cleanup to created test IDs only. |
| `server/src/controllers/inviteController.ts` | Add safety guards to `saveCanvas` guest roster transaction to prevent accidental total deletion. |
| `server/package.json` | Ensure deployment and build scripts do not run tests against live databases. |

## Scope Constraints
### In-Scope
- Scoped test cleanup in `server/tests/invite.test.ts`.
- Safety guards in `saveCanvas` for guest roster updates.
- Package script verification for Vercel deployment.

### Out-of-Scope
- Automated production database backup routines.
