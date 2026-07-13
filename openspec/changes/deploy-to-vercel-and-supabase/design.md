# Design — Deploy to Vercel and Supabase

## Architectural Decisions

### Decision 1: SQLite to PostgreSQL Migration
**Choice**: Migrate datasource provider to `postgresql`.
**Why**:
- SQLite stores data in local file structures. Serverless function instances are completely stateless and ephemeral, meaning SQLite files will be destroyed and reset between cold starts.
- Supabase provides a managed, persistent cloud-hosted PostgreSQL database.

### Decision 2: Direct and Pooled DB Connections
**Choice**: Configure `url = env("DATABASE_URL")` and `directUrl = env("DIRECT_URL")` inside Prisma.
**Why**:
- Serverless hosts spin up separate connection instances per execution, which can easily saturate PostgreSQL limits. Supabase routes pooled connections through PgBouncer.
- However, schema push and migrations require direct connection access because PgBouncer blocks administrative commands. Specifying `directUrl` routes Prisma push scripts directly to the database port, while queries use the connection pool.

### Decision 3: Express Routing via `@vercel/node`
**Choice**: Package the backend as a single Vercel node function mapping all requests `/(.*)` to the entry point `src/index.ts`.
**Why**:
- Prevents having to rewrite the Express routes and middleware as individual serverless handler files. `@vercel/node` wraps the entire Express server instance automatically.

---

## Risks & Mitigations

### Risk 1: Serverless Cold Start Latencies
- **Risk**: Vercel serverless functions can exhibit cold start delays on first invocation.
- **Mitigation**: Standard backend routes are kept lightweight; we avoid importing heavy libraries on the server start path.
