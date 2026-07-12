## 0. Setup: Server Workspace Initialization
- [x] 0.1 Create subdirectory `server/` at project root
- [x] 0.2 Initialize `server/package.json` with script targets (`build`, `dev`, `test`, `db:generate`)
- [x] 0.3 Install server dependencies (Express, Prisma, TypeScript, zod, supertest, vitest)
- [x] 0.4 Initialize TypeScript configuration `server/tsconfig.json` targeting Node environment

## 1. Database & ORM Setup
- [x] 1.1 Create `server/prisma/schema.prisma` with sqlite data source config
- [x] 1.2 Add `InvitationCanvas` and `Guest` models matching the design requirements
- [x] 1.3 Run `npx prisma generate` to build Prisma Client types
- [x] 1.4 Execute initial database push to establish tables locally

## 2. Express Application Boot
- [x] 2.1 Create `server/src/index.ts` boot file setting up Express
- [x] 2.2 Configure standard middleware (CORS, Express JSON parser, error boundaries)
- [x] 2.3 Set up a base health check endpoint `GET /api/health`

## 3. RBAC Middleware & Security Guards
- [x] 3.1 Create authentication middleware `server/src/middleware/auth.ts`
- [x] 3.2 Implement `requireRole(role: 'ADMIN' | 'HOST')` validator checking request header value (`X-Role`)
- [x] 3.3 Add unit tests verifying route access is denied with 403 status when incorrect/missing headers are supplied

## 4. Telemetry API Endpoints & Controller Logic
- [x] 4.1 Define Zod validation middleware checking URL param parameter structure
- [x] 4.2 Create controller file `server/src/controllers/inviteController.ts`
- [x] 4.3 Implement `getInviteByToken`:
  - Fetch guest by ID (token) along with their related canvas.
  - Return 404 if guest record is not found.
  - If guest status is currently `"PENDING"`, update status to `"OPENED"` and set `openedTimestamp` to the current system date.
  - Return invitation payload containing both guest attributes and canvas state.
- [x] 4.4 Create router `server/src/routes/invite.ts` mounting route controllers to Express instance

## 5. Integration API Validation Tests
- [x] 5.1 Create test file `server/tests/invite.test.ts` mapping test scenarios
- [x] 5.2 Test scenario: visiting `/api/invite/:token` with valid token returns 200, updates DB status, and records `openedTimestamp`
- [x] 5.3 Test scenario: subsequent calls to `/api/invite/:token` for an already-opened guest do not overwrite `openedTimestamp`
- [x] 5.4 Test scenario: invalid UUID format or missing guest token correctly yields 404 response
- [x] 5.5 Run backend unit tests and ensure zero failures

## 6. Build and Verification
- [x] 6.1 Execute `npm run build` inside `server/` verifying clean TS compilation
- [x] 6.2 Confirm server tests pass fully
- [x] 6.3 Register new workspace execution command `npm run dev:server` in root `package.json`
