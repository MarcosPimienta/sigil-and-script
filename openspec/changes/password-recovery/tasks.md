# Tasks: Password Recovery

## 1. Data model

- [x] 1.1 Add `PasswordResetToken` model and `User.resetTokens` relation to `server/prisma/schema.prisma` (see design.md).
- [ ] 1.2 Run `npm --prefix server run db:push` locally (and against the deployed database when releasing); confirm `prisma generate` picks up the new model.

## 2. Mailer service

- [x] 2.1 Add `resend` to `server/package.json` dependencies.
- [x] 2.2 Create `server/src/services/mailer.ts` exporting `sendPasswordResetEmail({ to, link }): Promise<void>` — Resend when `RESEND_API_KEY` is set, console log otherwise; HTML + text body; never throws to the caller (logs and resolves).
- [x] 2.3 Document `RESEND_API_KEY`, `MAIL_FROM`, `APP_URL` in `server/.env.example`.

## 3. Auth controller & routes

- [x] 3.1 Refactor `hashPassword` usage into a `makePasswordRecord(password)` helper returning `salt:hash`; use it in `register`.
- [x] 3.2 Implement `forgotPassword`: zod-validate email; look up user (lowercased); if none → 200; count tokens in last 15 min → 429 if ≥ 3; stamp `usedAt` on older unused tokens; create token (sha256 hash stored, 60-min expiry); send email with `${APP_URL}/?reset=<token>`; respond 200.
- [x] 3.3 Implement `resetPassword`: zod-validate `{ token, password(min 6) }`; hash token, find by `tokenHash`; reject if missing, `usedAt` set, or expired (400 with a single generic message); in a transaction update `user.password`, set `token.usedAt`, delete all sessions for the user; respond 200.
- [x] 3.4 Register `POST /forgot-password` and `POST /reset-password` in `server/src/routes/auth.ts`.

## 4. Server tests

- [x] 4.1 Create `server/tests/auth.test.ts` with `vi.mock('../src/services/mailer')`; create a test user in `beforeAll`, clean up tokens/sessions/user in `afterAll`.
- [x] 4.2 Test: unknown email → 200 and mailer not called.
- [x] 4.3 Test: known email → 200, mailer called once with a link containing `?reset=`, exactly one unused token row.
- [x] 4.4 Test: a second request invalidates the first token (first link → 400 on reset).
- [x] 4.5 Test: four rapid requests → fourth returns 429.
- [x] 4.6 Test: reset with the captured token → 200; login with the new password succeeds; login with the old password fails; the pre-existing session token now returns 401 on a protected route; re-using the token → 400.
- [x] 4.7 Test: expired token (set `expiresAt` in the past directly via Prisma) → 400; malformed token → 400; password shorter than 6 → 400.
- [x] 4.8 `npm --prefix server test` passes.

## 5. Frontend store

- [x] 5.1 Add `requestPasswordReset(email)` and `resetPassword(token, password)` to `SigilStore` interface and implementation in `src/state/sigilStore.ts`, setting `authStatus`/`authError` the same way `login` does.

## 6. Frontend views

- [x] 6.1 Create `src/components/auth/ForgotPasswordView.tsx` (`onBackToLogin` prop): email field, submit, success state ("If an account exists for that address, we've sent a reset link. Check your spam folder too."), back link.
- [x] 6.2 Create `src/components/auth/ResetPasswordView.tsx` (`token`, `onDone`, `onRequestNew` props): password + confirm, client-side checks mirroring `RegisterView`, success notice with "Sign in" button, error state offering "Request a new link".
- [x] 6.3 Add a "Forgot password?" link to `LoginView.tsx` (`onForgotPassword` prop).
- [x] 6.4 Extend `App.tsx`: `authView` union; read `?reset=` on mount, store in `resetToken`, `history.replaceState` to strip it; render the two new views.
- [x] 6.5 Styles in `src/styles/auth.css`: `.auth-link-row`, `.auth-notice` (success), reuse `.auth-error`.
- [x] 6.6 Component tests: `ForgotPasswordView.test.tsx` (submits email, shows success state) and `ResetPasswordView.test.tsx` (mismatch error, calls `resetPassword` with token, shows success) using the existing Testing Library setup and a mocked store.

## 7. Verification

- [x] 7.1 `npm run build` and `npm run lint` on the frontend: no new errors.
- [x] 7.2 `npm test` (frontend) and `npm --prefix server test` pass.
- [ ] 7.3 Manual end-to-end without Resend: start both servers, click "Forgot password?", submit a registered email, copy the link from the server console, open it, set a new password, confirm old sessions are logged out and the new password works.
- [ ] 7.4 With `RESEND_API_KEY` set: repeat 7.3 and confirm the email arrives with a working link.
- [ ] 7.5 On archive: add milestone `M9_PASSWORD_RECOVERY` to `openspec/specs/sigil_and_script_spec.json`, extend the `User` data contract with `resetTokens`, and merge the delta spec.

## Implementation notes (2026-09-02)

- **Server.** `PasswordResetToken` model added; `forgotPassword` / `resetPassword` in `authController.ts`; routes registered; `services/mailer.ts` (Resend, console fallback); `.env.example` documents the three env vars; `resend@^6.25` added to `server/package.json` + lockfile (requires Node ≥ 22.12, same as Vercel's Node 22 runtime).
- **Server tests.** `tests/auth.test.ts`: 8 tests covering enumeration-safe 200, token creation & hash-only storage, newest-link-wins, throttling (429 on the 4th request), malformed/unknown/expired tokens, weak password keeps token valid, and a full reset that revokes the old session, rejects the old password, accepts the new one and refuses token reuse. Whole server suite: 18/18 passing (`tsc --noEmit` clean).
- **Frontend.** `requestPasswordReset` / `resetPassword` store actions; `ForgotPasswordView`, `ResetPasswordView`, "Forgot password?" link and a one-off notice on `LoginView`; `App.tsx` reads `?reset=` once, strips it from the URL and shows the reset view even for a signed-in browser. 6 new component tests; full frontend suite 113/113; `tsc -b && vite build` clean; no new lint errors in touched files (`sigilStore.ts` keeps its 17 pre-existing ones).
- **End-to-end (7.3) verified in a headless browser against a real Postgres + the real server**: register → forgot → link captured from the server console (no `RESEND_API_KEY`) → open link (address bar cleaned to `/`) → set new password → old session gets 401 on `/canvas` → old link shows "invalid or expired" with "Request a new link" → sign-in with the new password succeeds. Six screenshots reviewed for styling consistency.
- **Sandbox caveat.** Prisma's engine download host is blocked in the verification sandbox, so tests there ran with an engine-less client plus a pg driver adapter injected by a test-only setup file. That harness is *not* part of the delivered code; on your machine the ordinary `prisma generate` / `db:push` path applies.

## For you to run

1. `cd server && npm install` (pulls `resend`), then `npm run db:push` to create the `PasswordResetToken` table locally — and once against the production database before deploying.
2. Start both servers, sign in screen → "Forgot password?" → submit your email → copy the link printed in the server console → complete the reset (task 7.3 on your machine).
3. When ready for real email: create a Resend account, verify your sending domain, set `RESEND_API_KEY`, `MAIL_FROM` and `APP_URL` in the server environment (locally in `server/.env`, on Vercel in the project settings), then repeat with a real inbox (7.4).
