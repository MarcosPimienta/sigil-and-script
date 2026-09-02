# Proposal: Password Recovery

**Change ID:** `password-recovery`
**Created:** 2026-09-02
**Status:** Awaiting approval

## Problem

Hosts who forget their password have no way back into their account. The auth layer (`server/src/controllers/authController.ts`) supports only register / login / logout, the `User` model has no recovery data, and the login screen offers no "Forgot password?" path. Because passwords are salted PBKDF2 hashes there is also no legitimate way for an administrator to hand a password back — a self-service reset flow is the only sound option.

## Proposed Solution

A standard **email-delivered, single-use, time-limited reset token** flow:

1. **Request.** From the login screen the host enters their email. `POST /auth/forgot-password` always responds `200 { success: true }` (whether or not the address exists, to prevent account enumeration). If a user exists, the server creates a `PasswordResetToken` (random 32-byte token; only its SHA-256 hash is stored; 60-minute expiry), invalidates any previous unused tokens for that user, and emails a link of the form `${APP_URL}/?reset=<token>`.
2. **Deliver.** Email is sent through **Resend** (HTTP API, serverless-friendly) using `RESEND_API_KEY` and `MAIL_FROM`. When `RESEND_API_KEY` is absent (local development) the server logs the reset link to the console instead of failing, so the flow is fully testable without an account.
3. **Reset.** The link opens the app; `App.tsx` reads `?reset=<token>` on mount (same pattern as `?guest=`) and shows a `ResetPasswordView`. `POST /auth/reset-password { token, password }` verifies the hash, expiry and unused state, stores the new salted hash, marks the token used, and **deletes every existing session for that user** so a stolen session cannot outlive the reset. The view then drops the host on the login screen with a success message.
4. **Abuse limits.** Per-email throttling is enforced in the database (max 3 requests per 15 minutes per user, counted from `PasswordResetToken.createdAt`) rather than in memory, because the API runs on Vercel serverless where process memory does not persist.

Email sending is isolated behind `server/src/services/mailer.ts` so the provider can be swapped without touching the controller.

## Files to Create & Modify

| File | Action | Purpose |
|---|---|---|
| `server/prisma/schema.prisma` | Modify | Add `PasswordResetToken` model (`id`, `tokenHash @unique`, `userId`, `expiresAt`, `usedAt?`, `createdAt`) with cascade delete from `User`; add `resetTokens` relation on `User`. |
| `server/src/services/mailer.ts` | Create | `sendPasswordResetEmail(to, link)` via Resend; console fallback when no API key. Reads `RESEND_API_KEY`, `MAIL_FROM`, `APP_URL`. |
| `server/src/controllers/authController.ts` | Modify | Add `forgotPassword` and `resetPassword` handlers; extract `hashPassword`/`makePasswordRecord` helpers shared with `register`. |
| `server/src/routes/auth.ts` | Modify | Register `POST /forgot-password` and `POST /reset-password`. |
| `server/tests/auth.test.ts` | Create | Supertest coverage: unknown email → 200; known email creates token and (mock) sends; expired/used/invalid token → 400; successful reset changes password, invalidates old sessions, and token cannot be reused; throttling returns 429. |
| `server/.env.example` | Modify | Document `RESEND_API_KEY`, `MAIL_FROM`, `APP_URL`. |
| `server/package.json` | Modify | Add `resend` dependency. |
| `src/state/sigilStore.ts` | Modify | Add `requestPasswordReset(email)` and `resetPassword(token, password)` actions (+ `authStatus`/`authError` reuse). |
| `src/components/auth/ForgotPasswordView.tsx` | Create | Email form; success state tells the host to check their inbox (always, regardless of account existence). |
| `src/components/auth/ResetPasswordView.tsx` | Create | New password + confirm form bound to the token from the URL; handles invalid/expired token errors with a "request a new link" path. |
| `src/components/auth/LoginView.tsx` | Modify | Add "Forgot password?" link. |
| `src/App.tsx` | Modify | Extend `authView` union with `'forgot' \| 'reset'`; read `?reset=` on mount, store the token, strip it from the URL. |
| `src/styles/auth.css` | Modify | Styles for the secondary link and success/notice states. |
| `openspec/specs/sigil_and_script_spec.json` | Modify (on archive) | Register milestone `M9_PASSWORD_RECOVERY`; extend the `User` data contract. |

## Scope Constraints

### In scope

- Forgot-password request, emailed single-use reset link, reset form, session invalidation on reset.
- Resend integration with a console fallback for development and tests.
- Database-backed request throttling.
- Server tests for the two new endpoints; frontend unit tests for the two new views.
- Bilingual copy is **not** required for auth screens today (existing `LoginView`/`RegisterView` are English-only); the new views follow the same convention.

### Out of scope

- Email verification at registration, two-factor auth, "change password while logged in" (a natural follow-up that can reuse `makePasswordRecord`).
- Branded HTML email templates beyond a clean, minimal HTML+text message.
- Migrating the local SQLite `dev.db` automatically — the schema change requires `npm run db:push` (documented in tasks).
- Any change to the guest/RSVP side of the app.
