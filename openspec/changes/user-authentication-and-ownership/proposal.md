# Proposal — User Authentication and Ownership

## Problem
The application currently runs without authentication:
- Any client configured in host mode can access, overwrite, or delete all saved configurations in the database.
- There is no user identity system to separate designs and events between different host users.
- We need a secure, lightweight authentication system to register users, log them in, and scope design configurations to their respective owners.

## Proposed Solution

1. **Database Schema Updates**:
   - Introduce a `User` model to store credentials and profile data.
   - Introduce a `Session` model to store active session tokens.
   - Update the `InvitationCanvas` model to include an optional `userId` foreign key relating to the `User` model (making it optional preserves backwards compatibility with legacy canvases).

2. **Backend Authentication APIs**:
   - Create a `auth.ts` router and controller supporting:
     * `POST /auth/register`: Create a new user account (using Node's built-in `crypto` PBKDF2 hashing for passwords).
     * `POST /auth/login`: Verify user credentials, generate a random secure session token, and return it.
     * `POST /auth/logout`: Delete the current session token from the database.
   - Implement an auth middleware `requireAuth` that retrieves the session token from the `Authorization: Bearer <token>` header, checks database validity, and resolves the user.
   - Restrict all `/canvas` endpoints to return or modify canvases belonging exclusively to the authenticated user.

3. **Frontend Integration & Views**:
   - Create a Zustand auth store module (or extend `sigilStore.ts` state) to handle user login, registration, logout, and token storage in `localStorage`.
   - Update `apiFetch` in [api.ts](file:///home/fenix3819/sigil-and-script/src/utils/api.ts) to automatically attach the `Authorization` header.
   - Design glassmorphic Login and Register views with validation feedback.
   - Toggle dashboard and editor studio views based on user login states.

---

## Files to Modify

| File | Change |
|---|---|
| `server/prisma/schema.prisma` | Add `User` and `Session` models; link `InvitationCanvas` to `User`. |
| `server/src/index.ts` | Mount the new `/auth` router path. |
| `server/src/routes/invite.ts` | Update `/canvas` routes to use the `requireAuth` middleware. |
| `server/src/controllers/inviteController.ts` | Filter queries and assignments by `req.user.id`. |
| `src/utils/api.ts` | Append `Authorization: Bearer <token>` dynamically to requests. |
| `src/state/sigilStore.ts` | Add actions for login, register, and logout. |
| `src/App.tsx` | Conditionally render login/register pages if not authenticated. |

## New Files

| File | Description |
|---|---|
| `server/src/routes/auth.ts` | Authentication route declarations (register, login, logout). |
| `server/src/controllers/authController.ts` | Hashing, session token creation, and validation logic. |
| `server/src/middleware/auth.ts` | Middleware to authenticate requests via Bearer headers. |
| `src/components/auth/LoginView.tsx` | UI form component for logging in. |
| `src/components/auth/RegisterView.tsx` | UI form component for registering. |

---

## Scope Constraints

- **In-Scope**:
  - Secure credential storage (PBKDF2 / Salt hashing).
  - Database-backed session tokens.
  - Multi-tenant canvas isolation.
  - Login/Register pages.
- **Out-of-Scope**:
  - Password reset emails (users can change passwords manually or reset via DB).
  - OAuth login (Google, GitHub, etc.).
