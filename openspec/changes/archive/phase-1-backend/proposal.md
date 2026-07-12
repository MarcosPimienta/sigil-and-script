# Proposal — Phase 1 Backend Infrastructure

## Problem
The current Sigil & Script application is a frontend-only SPA that stores data in client `localStorage`. It lacks:
- Real database persistence for guest rosters and invitation designs.
- Multi-tenancy access controls (Admin, Host, Guest roles).
- Secure token validation for guest invitations (e.g., dynamically resolving `/invite/[guest_token]`).
- Backend routes for telemetry (recording when an invitation is opened).

## Proposed Solution
Create the Phase 1 backend framework using Node.js, Express, TypeScript, and Prisma (database ORM) to manage:
1. **Database Schema**: Rigorous data models matching `GuestRecord` and `InvitationCanvasState` defined in Prisma.
2. **Access Control**: Role-based access control (RBAC) middleware for ADMIN, HOST, and GUEST roles.
3. **Invitation Route Router**: API endpoint `GET /api/invite/:token` to validate guest invitation tokens, update guest telemetry (`openedTimestamp` and status to `OPENED`), and return the canvas/guest configuration.

---

## Files to Create

| File | Purpose |
|---|---|
| `server/package.json` | Server dependencies (Express, Prisma, TypeScript, zod, dotenv, typescript-eslint). |
| `server/tsconfig.json` | TypeScript compiler configuration for backend code. |
| `server/prisma/schema.prisma` | Prisma database schemas matching canvas state and guest records. |
| `server/src/index.ts` | Express application entry point. |
| `server/src/middleware/auth.ts` | RBAC middleware guarding ADMIN and HOST interfaces. |
| `server/src/routes/invite.ts` | Routing endpoints for guest token validation and telemetry. |
| `server/src/controllers/inviteController.ts` | Controller logic handling token hydration and telemetry database writes. |
| `server/tests/invite.test.ts` | Supertest backend route validation tests. |

## Files to Modify

| File | Change |
|---|---|
| `package.json` | Add workspace server execution scripts (e.g. `npm run dev:server`). |

---

## Scope Constraints

- **In-Scope**:
  - Full backend infrastructure setup.
  - Prisma database schema definitions.
  - Route validation rules using Zod.
  - Token verification and telemetry backend controller endpoints.
  - Comprehensive Express API endpoint unit tests.

- **Out-of-Scope**:
  - Migrating frontend React Context to Zustand (reserved for Phase 2).
  - Integrating Tailwind CSS styles (reserved for Phase 2).
  - Creating any new frontend views.
