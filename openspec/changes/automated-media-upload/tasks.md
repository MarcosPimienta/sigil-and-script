# Tasks: Automated Supabase Storage Media Uploads

- [x] 1. Backend Route & Controller
  - [x] 1.1 Mount route `POST /upload/media` in `server/src/routes/invite.ts` under the existing host authentication middleware.
  - [x] 1.2 Implement the `uploadMedia` controller in `server/src/controllers/inviteController.ts` to decode the base64 JSON request body, execute a POST request to Supabase Storage REST endpoint using native Node `fetch`, and return the public access URL.
- [x] 2. Frontend Upload Integrations
  - [x] 2.1 Add upload API triggers to `handleAudioUpload` in `src/components/creator/LeftPanel.tsx` to upload selected audio to the backend and update the layout configuration with the returned URL. Add an inline loading state (*"Uploading audio..."*).
  - [x] 2.2 Add upload API triggers to `handleImageUpload` in `src/components/creator/LeftPanel.tsx` to upload selected images to the backend and update the layout configuration with the returned URL. Add inline loading states (*"Uploading image..."*).
- [x] 3. Frontend Store Guard
  - [x] 3.1 Update `saveCurrentDesign` in `src/state/sigilStore.ts` to replace any base64 data URIs inside `musicUrl` with `null` on save to ensure payload safety.
- [x] 4. Verification
  - [x] 4.1 Confirm unit tests (`npm run test`) pass.
  - [x] 4.2 Confirm compilation build (`npm run build`).
