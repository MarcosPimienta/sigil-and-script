## 1. Configure Prisma Schema
- [x] 1.1 Update [schema.prisma](file:///home/fenix3819/sigil-and-script/server/prisma/schema.prisma#L1) to use `postgresql` and specify connection pooling configurations.

## 2. Configure Vercel Serverless Function
- [x] 2.1 Create [vercel.json](file:///home/fenix3819/sigil-and-script/server/vercel.json) in the `server` directory directing all request routes to `src/index.ts`.
- [x] 2.2 Add a `postinstall` script in [package.json](file:///home/fenix3819/sigil-and-script/server/package.json#L7) to run `prisma generate`.

## 3. Support Dynamic API Urls
- [x] 3.1 Modify [api.ts](file:///home/fenix3819/sigil-and-script/src/utils/api.ts#L1) to read the backend URL from `import.meta.env.VITE_API_URL` dynamically.

## 4. Verification
- [x] 4.1 Run unit tests using `npm run test` to check for regressions.
- [x] 4.2 Run client build compiler with `npm run build` to confirm build integrity.
