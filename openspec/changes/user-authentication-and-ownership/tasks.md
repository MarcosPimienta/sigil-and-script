## 1. Configure Prisma Schema
- [x] 1.1 Add `User` and `Session` models and link `InvitationCanvas` in [schema.prisma](file:///home/fenix3819/sigil-and-script/server/prisma/schema.prisma#L10).
- [x] 1.2 Synchronize the database schema with Supabase using `npx prisma db push` inside the `server/` directory.

## 2. Implement Backend Authentication APIs
- [x] 2.1 Create [authController.ts](file:///home/fenix3819/sigil-and-script/server/src/controllers/authController.ts) containing register, login, and logout handlers.
- [x] 2.2 Create [auth.ts](file:///home/fenix3819/sigil-and-script/server/src/routes/auth.ts) declaring authentication routes.
- [x] 2.3 Create the `requireAuth` middleware in [auth.ts](file:///home/fenix3819/sigil-and-script/server/src/middleware/auth.ts) to authorize session tokens.
- [x] 2.4 Mount the `/auth` routes in [index.ts](file:///home/fenix3819/sigil-and-script/server/src/index.ts#L25).

## 3. Restrict Canvas APIs to Authenticated Owners
- [x] 3.1 Update [invite.ts](file:///home/fenix3819/sigil-and-script/server/src/routes/invite.ts#L9) to use `requireAuth` for all `/canvas` endpoints.
- [x] 3.2 Modify [inviteController.ts](file:///home/fenix3819/sigil-and-script/server/src/controllers/inviteController.ts#L50) to restrict CRUD canvas queries and actions to the logged-in user's ID.

## 4. Integrate Frontend Auth Store and Header Support
- [x] 4.1 Update `apiFetch` in [api.ts](file:///home/fenix3819/sigil-and-script/src/utils/api.ts#L6) to append the authorization session header dynamically from `localStorage`.
- [x] 4.2 Add Zustand store actions `login`, `register`, and `logout` inside [sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts#L80) to control user authentication states.

## 5. Build Login and Register Views
- [x] 5.1 Create the [LoginView.tsx](file:///home/fenix3819/sigil-and-script/src/components/auth/LoginView.tsx) login interface.
- [x] 5.2 Create the [RegisterView.tsx](file:///home/fenix3819/sigil-and-script/src/components/auth/RegisterView.tsx) register interface.
- [x] 5.3 Integrate the auth screens in [App.tsx](file:///home/fenix3819/sigil-and-script/src/App.tsx#L1), and append a profile segment and logout option inside [Toolbar.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/Toolbar.tsx#L38).

## 6. Verification
- [x] 6.1 Run server unit tests with `npm test` inside the `server/` directory.
- [x] 6.2 Run client unit tests with `npm run test` inside the root workspace.
- [x] 6.3 Run `npm run build` in root workspace to confirm compiling.
