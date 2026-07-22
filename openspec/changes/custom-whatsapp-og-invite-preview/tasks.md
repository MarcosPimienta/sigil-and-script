# Implementation Tasks

- [x] 1. Backend Controller & Route Updates
  - [x] 1.1 Update `server/src/controllers/inviteController.ts`: implement `getInviteOgHtml` handler formatting `Invitation for [Guest Name] to [Event Name]` title and closed envelope `og:image`
  - [x] 1.2 Update `server/src/routes/invite.ts`: configure route handler to return HTML Open Graph tags for `/invite/:token` requests

- [x] 2. Frontend HTML Updates
  - [x] 2.1 Update `index.html`: add static fallback Open Graph tags for closed envelope thumbnail and invitation titles

- [x] 3. Verification & Testing
  - [x] 3.1 Update unit tests in `server/tests/invite.test.ts` asserting Open Graph HTML meta tags and title format
  - [x] 3.2 Run test suite `npm run test` and `npm run build` to confirm zero errors
