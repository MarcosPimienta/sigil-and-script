# Tasks: Secure Supabase RLS and API Access

- [x] 1. SQL & Script Creation
  - [x] 1.1 Create `server/prisma/enable_rls.sql` with statements to enable RLS and revoke public role grants.
  - [x] 1.2 Create `server/scripts/enable-rls.js` automated runner using Prisma.
  - [x] 1.3 Add `"db:secure": "node scripts/enable-rls.js"` to `server/package.json`.

- [x] 2. Execution & Database Hardening
  - [x] 2.1 Execute `npm run db:secure` against the remote Supabase database.
  - [x] 2.2 Verify that all 5 tables (`User`, `Session`, `PasswordResetToken`, `InvitationCanvas`, `Guest`) report `rowsecurity: true`.

- [x] 3. Regression Testing
  - [x] 3.1 Run Vitest backend test suite (`npm --prefix server test`).
  - [x] 3.2 Ensure all 24 tests across `auth.test.ts`, `invite.test.ts`, and `eventPhrasing.test.ts` pass without errors.
