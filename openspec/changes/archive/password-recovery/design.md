# Design: Password Recovery

## Flow

```
 LoginView ── "Forgot password?" ──► ForgotPasswordView
                                          │ POST /auth/forgot-password { email }
                                          ▼
                              server: find user (case-insensitive)
                                 ├─ none → 200 { success:true }      (no enumeration)
                                 ├─ ≥3 tokens in last 15 min → 429
                                 └─ create PasswordResetToken
                                      token     = randomBytes(32).hex   (sent)
                                      tokenHash = sha256(token)         (stored)
                                      expiresAt = now + 60 min
                                    invalidate older unused tokens (usedAt = now)
                                    mailer.sendPasswordResetEmail(email, APP_URL/?reset=token)
                                          │
                                          ▼
                              host opens link ─► App.tsx reads ?reset=, strips URL,
                                                 authView = 'reset' ─► ResetPasswordView
                                          │ POST /auth/reset-password { token, password }
                                          ▼
                              server: hash token → find; check usedAt=null & expiresAt>now
                                 ├─ fail → 400 "This reset link is invalid or has expired"
                                 └─ ok  → user.password = salt:pbkdf2
                                          token.usedAt = now
                                          session.deleteMany({ userId })
                                          200 { success:true }
                                          │
                                          ▼
                              ResetPasswordView → success notice → LoginView
```

## Architectural decisions

### AD-1: Store only a hash of the token

**Choice.** The database keeps `sha256(token)`; the plaintext token exists only in the email link and the request body.

**Why.** A database leak (or a log line) must not be enough to reset someone's password. SHA-256 is adequate here because the token is 256 bits of CSPRNG output — no dictionary attack is possible, so a slow KDF is unnecessary and would only slow down lookups.

### AD-2: Single use, 60-minute expiry, one live token per user

**Choice.** `usedAt` marks consumption; issuing a new token stamps `usedAt` on any older unused tokens. Expiry is 60 minutes.

**Why.** Short-lived, single-use links are the accepted baseline (OWASP Forgot Password guidance). Invalidating older tokens means only the most recently sent email works, which avoids confusion when a host clicks "send again".

### AD-3: Uniform response on request

**Choice.** `/auth/forgot-password` returns `200 { success: true }` for unknown emails, for throttled-but-unknown emails, and after successfully sending. Only a *known* user hitting the throttle sees `429`.

**Why.** Prevents using the endpoint to discover which emails have accounts. The 429 for known users is a deliberate trade-off: it gives a real host feedback when they are spamming the button, and an attacker learns nothing they could not learn by receiving the 200 three times.

### AD-4: Database-backed throttling

**Choice.** Count `PasswordResetToken` rows for the user with `createdAt > now − 15 min`; refuse at 3.

**Why.** The API runs on Vercel serverless; in-memory counters reset per cold start and are not shared across instances. The token table already records exactly the events we need to count, so no extra model or Redis dependency is required.

### AD-5: Invalidate all sessions on successful reset

**Choice.** `prisma.session.deleteMany({ where: { userId } })` inside the reset transaction.

**Why.** The typical reason to reset is suspicion of compromise. Leaving old 30-day sessions alive would defeat the purpose. The host is then asked to sign in with the new password.

### AD-6: Resend behind a tiny mailer service, with console fallback

**Choice.** `server/src/services/mailer.ts` exposes `sendPasswordResetEmail({ to, link })`. If `RESEND_API_KEY` is unset it logs `[mailer] Password reset link for <email>: <link>` and resolves; in tests it is mocked with `vi.mock`.

**Why.** Resend is a single HTTPS call (no SMTP sockets, which are unreliable on serverless), has a free tier, and needs one env var. The fallback keeps local development and CI free of secrets and lets you test the whole flow today by copying the link from the terminal.

**Config.**

| Variable | Purpose | Example |
|---|---|---|
| `RESEND_API_KEY` | Resend API key; absent → console fallback | `re_…` |
| `MAIL_FROM` | Sender identity (domain must be verified in Resend) | `Sigil & Script <noreply@yourdomain.com>` |
| `APP_URL` | Frontend origin used to build the link | `https://sigil-and-script-frontend.vercel.app` / `http://localhost:5173` |

### AD-7: Query-param entry point, no router

**Choice.** `App.tsx` already reads `/invite/<token>` and `?guest=` once on mount; `?reset=<token>` follows the same pattern, storing the token in component state and calling `history.replaceState` to strip it from the address bar.

**Why.** Consistent with the codebase, zero new dependencies, and the token leaves the URL (and browser history / referrer headers) immediately.

### AD-8: Password rules mirror registration

**Choice.** The reset endpoint reuses the same zod rule as registration (`min(6)`); the view mirrors `RegisterView`'s confirm-password check.

**Why.** One source of truth for what a valid password is; tightening rules later happens in one schema.

## Data model

```prisma
model PasswordResetToken {
  id        String    @id @default(uuid())
  tokenHash String    @unique
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([userId, createdAt])
}

model User {
  …
  resetTokens PasswordResetToken[]
}
```

Applied with `npm run db:push` (local SQLite `dev.db` and the Postgres deployment alike — the project does not use migration files).

## API

| Method & path | Body | Responses |
|---|---|---|
| `POST /auth/forgot-password` | `{ email }` | `200 { success: true }` · `400` invalid email · `429 { error }` throttled (known user only) |
| `POST /auth/reset-password` | `{ token, password }` | `200 { success: true }` · `400 { error }` invalid/expired/used token or weak password |

Both are public (no `requireAuth`), matching `/auth/login`.

## Frontend state

`sigilStore` gains two actions that reuse `authStatus` / `authError`:

```ts
requestPasswordReset: (email: string) => Promise<boolean>;
resetPassword: (token: string, password: string) => Promise<boolean>;
```

`App.tsx`: `authView: 'login' | 'register' | 'forgot' | 'reset'` plus `resetToken: string | null`.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Email lands in spam / never arrives. | `MAIL_FROM` on a verified domain; plain-text alternative in the message; UI copy says "check spam"; console fallback in dev so the flow is testable regardless. |
| `RESEND_API_KEY` set but sending fails (quota, bad domain). | The controller logs the provider error and still returns 200 (no enumeration), and in non-production also logs the link. |
| Token guessed by brute force. | 256-bit random token; lookups are by unique hash; expiry 60 min. |
| Reset link opened after the host already logged in elsewhere. | The reset view is shown regardless of auth state; on success sessions are cleared and the host re-authenticates. |
| Throttle blocks a legitimate host. | 3 per 15 min is generous; the 429 message states the wait time. |
| `dev.db` out of date after pull. | tasks.md includes `npm run db:push`; the server logs a clear Prisma error otherwise. |
| Server tests need a database. | Existing `invite.test.ts` already runs against the configured `DATABASE_URL`; the new tests follow the same pattern and clean up their rows in `afterAll`. Mailer is mocked so no network is needed. |
