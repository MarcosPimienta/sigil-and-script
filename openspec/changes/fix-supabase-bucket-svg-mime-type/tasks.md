# Implementation Tasks

- [x] 1. Code Updates
  - [x] 1.1 Update `SectionEditor.tsx`: set `fileType: 'image/svg+xml'` for SVG uploads
  - [x] 1.2 Update `LeftPanel.tsx`: set `fileType: 'image/svg+xml'` for SVG uploads
  - [x] 1.3 Update `server/src/controllers/inviteController.ts`: force `application/octet-stream` fallback and add `x-upsert: true` header for SVG uploads

- [x] 2. Verification & Testing
  - [x] 2.1 Run test suite `npm run test` and `npm run build` to confirm zero errors
