# Proposal: Fix Top Ornament / Title Image Persistence on Save

## Problem
When hosts upload a top ornament or title image (`headerImage`), the image renders in the preview session, but when returning to or refreshing the invitation, the ornament is lost.
This occurs because:
1. `saveCurrentDesign()` in `sigilStore.ts` stripped all base64 data URLs starting with `data:image/` by setting them to `undefined` before sending to `/canvas`.
2. Supabase Storage rejected SVG file uploads with a 415 `invalid_mime_type` error, forcing the frontend to fall back to base64 data URLs which were subsequently deleted on save.

## Proposed Solution
1. **Preserve Uploaded Images on Save ([sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts))**:
   - Modify `saveCurrentDesign()` so image data URLs under 2MB (including SVGs and compressed images) are preserved in `designData` rather than stripped.
2. **Supabase SVG Upload Fallback ([inviteController.ts](file:///home/fenix3819/sigil-and-script/server/src/controllers/inviteController.ts))**:
   - If Supabase returns HTTP 415 for `image/svg+xml`, retry uploading with `application/octet-stream` so Supabase accepts SVG assets into the storage bucket.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/state/sigilStore.ts` | Modify | Preserve base64 image data URLs under 2MB in `saveCurrentDesign()` |
| `server/src/controllers/inviteController.ts` | Modify | Add MIME type fallback for SVG uploads to Supabase Storage |

## Scope Constraints
- In Scope: Persisting `headerImage` and uploaded artwork across save/load cycles and supporting SVG uploads.
- Out of Scope: Altering non-image layout properties.
