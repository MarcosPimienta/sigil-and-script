# Proposal: Automated Supabase Storage Media Uploads

## Problem
1. **Payload Size Limits**: Large media assets (audio files and background images) converted to base64 strings exceed Vercel's strict 4.5MB serverless function payload limit.
2. **Manual Buckets Overhead**: Forcing hosts to manually upload media files to Supabase, copy URLs, and paste them is a poor user experience. We need this upload flow to be fully automatic from the Creator Studio invitation.

## Proposed Solution
- **Backend Media Upload API**: Create a secure backend endpoint `POST /upload/media` (requires HOST role authentication) that:
  - Accepts a JSON body containing raw base64 data, the target bucket (e.g. `invitation-music` or `invitation-images`), filename, and MIME type.
  - Converts the base64 data back to a raw Buffer.
  - Streams the file directly to Supabase Storage via native HTTPS REST requests using `fetch`.
  - Returns the generated public URL of the uploaded asset.
- **Automated Frontend Uploads**:
  - Update `LeftPanel.tsx` to automatically call the upload API when a user selects a local audio or image file.
  - Display a temporary loading spinner / upload status (e.g., *"Subiendo archivo..."*) during the upload.
  - Replace the local base64 preview string with the returned public URL.
- **Payload Safety Guard**: If a user somehow attempts to save a layout containing a local base64 audio file that wasn't uploaded, strip it from the save payload to prevent CORS/413 errors.

## Files to Modify

| File Path | Change |
| --- | --- |
| `server/src/routes/invite.ts` | Mount the `POST /upload/media` route under the authentication middleware. |
| `server/src/controllers/inviteController.ts` | Implement `uploadMedia` controller to handle raw base64 parsing and Supabase Storage HTTP uploads. |
| `src/components/creator/LeftPanel.tsx` | Trigger backend upload on image/audio selection and render inline loading states. |
| `src/state/sigilStore.ts` | Fallback guard to block sending raw base64 audio data inside save layout body. |

## Scope Constraints
- **In-Scope**:
  - Uploading audio files under 3MB automatically to `invitation-music`.
  - Uploading custom layout images automatically to `invitation-images`.
  - Showing upload loading feedback states in Creator Studio panel.
  - Direct HTTPS streaming using standard Node fetch (no new backend SDK dependencies).
- **Out-of-Scope**:
  - Automatically creating buckets from code (buckets `invitation-music` and `invitation-images` must be pre-created by the user in the Supabase console).
  - Syncing local guest roster outside the save layout command.
