# Tasks: Fix Invitee Name Missing in Social Link Previews

- [x] 1. Update `api/invite.js` to add explicit `Accept: application/json` and `User-Agent` headers in `fetch` call and improve token extraction.
- [x] 2. Update `server/src/controllers/inviteController.ts` to check `acceptsJson` before serving crawler HTML.
- [x] 3. Add unit test verification for `Accept: application/json` crawler requests in `server/tests/invite.test.ts`.
- [x] 4. Run automated test suite (`npm test`) and simulate node social crawler fetch against live endpoints.
