# Spec: Password Recovery

**Spec ID:** `password-recovery`
**Capability:** HOST tenant → Authentication

## Requirements

### Requirement: Request a password reset

A host SHALL be able to request a password reset by email from the sign-in screen without being authenticated.

#### Scenario: Registered email
- **WHEN** a host submits a registered email address to `POST /auth/forgot-password`
- **THEN** the server responds `200 { success: true }`, creates a single unused reset token that expires 60 minutes later, and sends one email containing a link to `${APP_URL}/?reset=<token>`.

#### Scenario: Unregistered email
- **WHEN** an unregistered email address is submitted
- **THEN** the server responds `200 { success: true }`, sends nothing, and the UI shows the same confirmation message as for a registered email.

#### Scenario: Repeated requests
- **WHEN** a second request is made for the same account before the first token is used
- **THEN** the first token becomes invalid and only the newest link works.

#### Scenario: Throttling
- **WHEN** more than three requests are made for the same registered account within 15 minutes
- **THEN** the server responds `429` with a message stating when the host may try again.

#### Scenario: No email provider configured
- **WHEN** `RESEND_API_KEY` is not set
- **THEN** the server logs the reset link to its console and still responds `200`, so the flow can be exercised in development.

### Requirement: Reset the password with a token

#### Scenario: Valid token
- **WHEN** `POST /auth/reset-password` is called with an unused, unexpired token and a password of at least 6 characters
- **THEN** the user's password is replaced with a new salted PBKDF2 hash, the token is marked used, all of the user's sessions are deleted, and the server responds `200 { success: true }`.

#### Scenario: Invalid, expired or used token
- **WHEN** the token is unknown, expired, or already used
- **THEN** the server responds `400` with a single generic message ("This reset link is invalid or has expired") and no state changes.

#### Scenario: Weak password
- **WHEN** the new password is shorter than 6 characters
- **THEN** the server responds `400` and the token remains valid.

#### Scenario: Old sessions after reset
- **WHEN** a session token issued before the reset is used on a protected route
- **THEN** the server responds `401`.

### Requirement: Reset link entry point in the app

#### Scenario: Opening the emailed link
- **WHEN** the app loads with `?reset=<token>` in the URL
- **THEN** it shows the reset-password form bound to that token and removes the parameter from the address bar without a reload.

#### Scenario: Successful reset in the UI
- **WHEN** the host submits matching passwords and the server responds `200`
- **THEN** the UI shows a success notice and offers a button to the sign-in screen.

#### Scenario: Failed reset in the UI
- **WHEN** the server responds `400`
- **THEN** the UI shows the error and offers a "Request a new link" action leading to the forgot-password form.

### Requirement: Token storage

#### Scenario: Database contents
- **WHEN** a reset token is created
- **THEN** only its SHA-256 hash is persisted; the plaintext token is never stored or logged in production.

### Requirement: Sign-in screen

The sign-in screen SHALL include a "Forgot password?" link leading to the request form.

### Requirement: `User` data contract

`User` gains a `resetTokens` relation (`PasswordResetToken[]`). No existing field changes.

## Explicit Non-Modifications

- Registration, login and logout endpoints and their responses.
- PBKDF2 parameters (`10000` iterations, 64 bytes, SHA-512) and the `salt:hash` storage format.
- Session lifetime (30 days) for sessions created after a reset.
- Guest/RSVP endpoints and `requireAuth` / `requireRole` middleware.
