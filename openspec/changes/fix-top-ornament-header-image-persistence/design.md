# Technical Design: Fix Top Ornament Image Persistence

## Architectural Decisions

1. **Base64 Image Omission Threshold**:
   - In `sigilStore.ts` `saveCurrentDesign()`:
     ```typescript
     if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 2_000_000) {
       (cleanedDesign as any)[f] = undefined;
     }
     ```
   - Only omit extreme base64 payloads (> 2MB) to prevent 413 Payload Too Large while preserving normal artwork, SVGs, and ornaments.

2. **Server SVG Storage Handling**:
   - In `server/src/controllers/inviteController.ts` `uploadMedia`:
     ```typescript
     if (!uploadRes.ok && fileType === 'image/svg+xml') {
       uploadRes = await fetch(targetUrl, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${supabaseKey}`,
           'Content-Type': 'application/octet-stream',
         },
         body: buffer,
       });
     }
     ```
