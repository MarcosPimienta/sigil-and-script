# Technical Design: Media Upload Parameters & SVG Vector Support

## Architectural Decisions

1. **Upload Request Contract**:
   - Backend endpoint: `POST /upload/media`
   - Required Body Schema:
     ```json
     {
       "fileData": "data:image/svg+xml;base64,...",
       "fileName": "title.svg",
       "fileType": "image/svg+xml",
       "bucket": "invitation-images"
     }
     ```

2. **SVG Vector Bypassing**:
   - Condition: `const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');`
   - If `isSvg` is true:
     - `fileData` = `reader.result` (raw SVG data URL).
     - `fileType` = `'image/svg+xml'`.
   - If `isSvg` is false:
     - `fileData` = `await compressImage(reader.result, format, 0.85)` (raster PNG/JPEG compression).

3. **Fallback & Reliability**:
   - On network error or backend failure, catch exception and execute `updateDesign({ headerImage: reader.result })`.
   - Guarantees immediate preview update without blocking the user.
