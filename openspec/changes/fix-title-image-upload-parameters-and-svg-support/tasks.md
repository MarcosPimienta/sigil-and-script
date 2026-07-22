# Implementation Tasks

- [x] 1. Code Fixes
  - [x] 1.1 Update `SectionEditor.tsx`: pass `fileName`, `fileType`, `bucket: 'invitation-images'` in `/upload/media` body
  - [x] 1.2 Update `SectionEditor.tsx` & `LeftPanel.tsx`: detect SVG files and bypass canvas compression to preserve vector SVG quality
  - [x] 1.3 Add try/catch error fallback storing data URL locally for instant preview

- [x] 2. Verification
  - [x] 2.1 Run test suite `npm run test` and `npm run build` to verify zero errors
