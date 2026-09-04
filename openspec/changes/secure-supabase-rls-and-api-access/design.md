# Design: Supabase Row-Level Security (RLS) & Access Control

## Architectural Overview

The Sigil & Script web application adopts a traditional client-server architecture:
1. **Frontend (`src/`)**: A Vite + React application. It connects only to the backend API (`/api/...`) and never directly queries Supabase PostgREST endpoints.
2. **Backend (`server/`)**: An Express application running on Node.js / Vercel Serverless. It connects to Supabase's hosted PostgreSQL database via Prisma ORM using connection string credentials (`DATABASE_URL`, `DIRECT_URL`) authenticated as `postgres` (the database superuser / table owner).
3. **Supabase PostgREST API**: Supabase automatically mounts an HTTP REST API on the `public` schema. It authenticates incoming requests using JWTs or anon keys mapped to the PostgreSQL roles `anon` and `authenticated`.

## Security Model

```
External Internet / Public Anon Key
               │
               ▼
   [Supabase PostgREST API]
               │
    (Role: anon / authenticated)
               │
               ▼
   ┌───────────────────────┐
   │ RLS: ENABLED          │
   │ Grants: REVOKED       │ ──► [BLOCKED: 401 / 403 / 0 rows]
   └───────────────────────┘

Express Backend (server/)
               │
   (Role: postgres / table owner)
               │
               ▼
   ┌───────────────────────┐
   │ Bypasses RLS          │ ──► [FULL READ / WRITE ACCESS]
   │ (PostgreSQL Default)  │
   └───────────────────────┘
```

### 1. Row-Level Security Strategy
By executing `ALTER TABLE "public"."<table>" ENABLE ROW LEVEL SECURITY;`:
- Any query originating from non-owner roles (`anon`, `authenticated`) without an explicit `CREATE POLICY ... FOR SELECT / ALL` is denied by default.
- Since no permissive policies are added, external PostgREST queries return zero records and cannot mutate data.

### 2. Role Privilege Revocation
To add defense-in-depth:
- `REVOKE ALL ON TABLE "public"."<table>" FROM anon, authenticated;`
- `ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;`
Even if a permissive policy was inadvertently created later, the lack of table-level privileges blocks access at the database permission layer.

### 3. Execution & Verification Script
`server/scripts/enable-rls.js`:
- Uses the project's existing `@prisma/client` instance.
- Iterates sequentially through DDL statements using `prisma.$executeRawUnsafe`.
- Queries `pg_tables` for `tablename` and `rowsecurity` in the `public` schema to log confirmation.
