# Proposal — Deploy to Vercel and Supabase

## Problem
The application is configured exclusively for local development:
- The backend relies on a local SQLite database file, which is volatile on serverless hosts like Vercel.
- The client hardcodes the API URL to `http://localhost:5001`.
- There are no configuration files to package the Express server as Vercel serverless functions.

We need to adapt the codebase to enable hosting the client and server on Vercel and integrating the backend with a Supabase PostgreSQL instance.

## Proposed Solution

1. **Supabase Integration (PostgreSQL)**:
   - Modify the database datasource provider in [schema.prisma](file:///home/fenix3819/sigil-and-script/server/prisma/schema.prisma) to use `postgresql`.
   - Add support for `directUrl` in the schema for direct migration connections, while utilizing transaction pooling for the main connection.

2. **Vercel Serverless Configurations**:
   - Create a [vercel.json](file:///home/fenix3819/sigil-and-script/server/vercel.json) file in the `server` folder directing incoming traffic to the entry point `src/index.ts` built by `@vercel/node`.
   - Add a `postinstall: "prisma generate"` script in [package.json](file:///home/fenix3819/sigil-and-script/server/package.json) to generate the typed client files automatically on deployment builds.

3. **Dynamic Client API Endpoint**:
   - Update [api.ts](file:///home/fenix3819/sigil-and-script/src/utils/api.ts) to read the backend API URL dynamically from `import.meta.env.VITE_API_URL` (falling back to `http://localhost:5001` locally).

---

## Files to Modify

| File | Change |
|---|---|
| `server/prisma/schema.prisma` | Change provider to `postgresql` and specify connection properties. |
| `server/package.json` | Add a `postinstall` script to generate Prisma Client on deploy. |
| `src/utils/api.ts` | Make the API URL fallback to an environment variable. |

## New Files

| File | Description |
|---|---|
| `server/vercel.json` | Vercel serverless configuration mapping routes to the Express entry point. |

---

## Scope Constraints

- **In-Scope**:
  - Updating database configurations for PostgreSQL/Supabase.
  - Adding configuration files for Vercel Serverless deployments.
  - Making client fetch paths dynamic.
- **Out-of-Scope**:
  - Running CLI deployments directly to Vercel/Supabase servers (this will be handled by the user via the respective dashboards using the variables).
