# Technical Design: Fix Database Record Wiping & Secure Vercel Deployment

## Architectural Decisions

### Decision 1: Scoped Test Resource Cleanup
- **Choice**: Track created IDs in `server/tests/invite.test.ts` (`testCanvasIds`, `testGuestIds`).
- **Cleanup Logic**:
  ```typescript
  const createdGuestIds: string[] = [];
  const createdCanvasIds: string[] = [];

  afterAll(async () => {
    if (createdGuestIds.length > 0) {
      await prisma.guest.deleteMany({ where: { id: { in: createdGuestIds } } });
    }
    if (createdCanvasIds.length > 0) {
      await prisma.invitationCanvas.deleteMany({ where: { id: { in: createdCanvasIds } } });
    }
    await prisma.$disconnect();
  });
  ```
- **Reasoning**: Completely eliminates global `deleteMany()` calls that wipe real user data if tests run against a live database.

### Decision 2: Guarded Roster Sync in `saveCanvas`
- **Choice**: In `server/src/controllers/inviteController.ts`, only execute guest deletion if `invitees` is explicitly an array and `activeGuestIds.length > 0`. If `activeGuestIds` is empty, do not execute un-scoped deletion unless specifically requested.

### Decision 3: Vercel Deployment Safety
- **Choice**: Ensure Vercel build command runs `tsc` and `prisma generate` safely. `vitest` unit tests should only be run in local/CI environments with isolated test databases or mocked clients.

## Risks & Mitigations
- **Orphan Test Records**: If a test fails mid-execution, `afterAll` still runs and cleans up all tracked `createdGuestIds` and `createdCanvasIds`.
