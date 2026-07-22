# Proposal: Fix Media Upload Parameters and Enable Vector SVG Support

## Problem
1. **400 Bad Request Error**: Uploading a title image in `SectionEditor.tsx` triggered a 400 Bad Request error (`Missing required parameters: fileData, fileName, fileType, bucket`) because `fileName` and `bucket` were omitted from the API request payload.
2. **SVG Image Support**: Users want full support for `.svg` vector files. Passing `.svg` through canvas rasterization distorts or degrades vector quality.

## Proposed Solution
1. **API Payload Parameters**: Pass all required parameters (`fileData`, `fileName`, `fileType`, `bucket: 'invitation-images'`) in `SectionEditor.tsx` when invoking `/upload/media`.
2. **SVG Vector Preservation**: Detect SVG files (`image/svg+xml` or `.svg` extension) and bypass canvas compression to preserve raw vector data URLs for high-crispness rendering.
3. **Local Fallback**: Add try/catch error handling that falls back to storing the base64 data URL locally so uploads always display instantly in preview regardless of backend network or storage status.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/components/creator/SectionEditor.tsx` | Modify | Pass required upload params (`fileName`, `bucket`), bypass compression for SVG, add local fallback |
| `src/components/creator/LeftPanel.tsx` | Modify | Bypass compression for SVG uploads to preserve vector quality |

## Scope Constraints
- In Scope: Fixing `/upload/media` request payload, preserving SVG vector files, adding local upload fallback.
- Out of Scope: Changing database schemas.
