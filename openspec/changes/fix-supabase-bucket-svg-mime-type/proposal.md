# Proposal: Fix Supabase Storage Bucket SVG Upload MIME Type Error

## Problem
When uploading SVG ornament files (such as `/icons/top-ornament.svg`), Supabase Storage bucket `invitation-images` returns HTTP 415 `invalid_mime_type` because Supabase buckets restrict `image/svg+xml` uploads by default.

## Proposed Solution
1. **Frontend Request MIME Type ([SectionEditor.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/SectionEditor.tsx), [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx))**:
   - For SVG files, send `fileType: 'application/octet-stream'` in the payload to `/upload/media`.
2. **Backend Controller Fallback ([inviteController.ts](file:///home/fenix3819/sigil-and-script/server/src/controllers/inviteController.ts))**:
   - Ensure `uploadMedia` defaults SVG uploads to `application/octet-stream` when sending binary headers to Supabase Storage, and includes `x-upsert: true`.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/components/creator/SectionEditor.tsx` | Modify | Use `application/octet-stream` for SVG upload payload |
| `src/components/creator/LeftPanel.tsx` | Modify | Use `application/octet-stream` for SVG upload payload |
| `server/src/controllers/inviteController.ts` | Modify | Ensure Supabase REST API request headers use `application/octet-stream` for SVG assets |

## Scope Constraints
- In Scope: Supabase bucket SVG media upload support.
- Out of Scope: Non-media upload logic.
