# Proposal: Enable Row-Level Security (RLS) & Secure Supabase Public Tables

## Problem
Supabase Security Advisor identified two critical security alerts on project `sigil-and-script` (`uytmrznwjxtxmimwwqzp`):
1. **`rls_disabled_in_public`**: Tables in the `public` schema (`User`, `Session`, `PasswordResetToken`, `InvitationCanvas`, `Guest`) had Row-Level Security (RLS) disabled.
2. **`sensitive_columns_exposed`**: Tables containing sensitive authentication and identity fields (`password` hash, `email`, `token`, `tokenHash`, `formResponses`) were accessible via Supabase's automatic PostgREST REST API using the anonymous public key.

Because Prisma does not enable PostgreSQL Row-Level Security by default when creating or synchronizing tables via `prisma db push`, tables in the `public` schema were left open to unrestricted public REST API requests.

## Proposed Solution
1. **Enable Row-Level Security (RLS)**: Enforce RLS across all application tables (`InvitationCanvas`, `Guest`, `User`, `Session`, `PasswordResetToken`) in the `public` schema.
2. **Revoke PostgREST Public API Privileges**: Revoke all permissions on these tables from the `anon` and `authenticated` roles used by Supabase's PostgREST API, completely blocking external REST API access.
3. **Automate Security Script**: Provide a SQL migration script (`enable_rls.sql`) and a Node.js script (`scripts/enable-rls.js`) hooked into `server/package.json` as `npm run db:secure` so RLS can be enforced after any future database updates.
4. **Zero Impact on Backend Application**: Because the Sigil & Script backend connects to PostgreSQL via Prisma as the table owner (`postgres`), and PostgreSQL table owners bypass RLS by default, all existing Express endpoints and Vitest test suites continue working seamlessly.

## Files Created & Modified
| File Path | Action | Description |
| --- | --- | --- |
| `server/prisma/enable_rls.sql` | Create | SQL migration to enable RLS, revoke anon/authenticated permissions, and restrict default privileges. |
| `server/scripts/enable-rls.js` | Create | Automated migration runner with verification output against `pg_tables`. |
| `server/package.json` | Modify | Added `"db:secure": "node scripts/enable-rls.js"` npm script. |

## Scope Constraints
### In-Scope
- Enabling RLS on all 5 tables in `public` schema.
- Revoking permissions from `anon` and `authenticated` roles.
- Setting default privileges to prevent auto-granting access on future tables.
- Node.js script and SQL file for repeatable execution.
- Verification that all backend tests pass without error.

### Out-of-Scope
- Client-side direct Supabase SDK integration (frontend continues to talk exclusively to Express backend).
- Storage bucket access policy changes (storage uses service role key and is handled separately).
