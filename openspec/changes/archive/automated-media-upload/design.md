# Design: Automated Supabase Storage Media Uploads

This document outlines the architectural decisions, API schemas, and security configurations for integrating automated file uploads to Supabase Storage.

## Architectural Decisions

### 1. Base64 JSON Upload Endpoint
We will accept uploads via a standard JSON request body carrying a base64 string instead of using multipart/form-data (which would require parsing packages like `multer`).
- **Format**:
  ```json
  {
    "fileData": "data:audio/mpeg;base64,...",
    "fileName": "song.mp3",
    "fileType": "audio/mpeg",
    "bucket": "invitation-music"
  }
  ```
- **Rationale**: Keeps the backend routing extremely clean and avoids adding third-party multipart streaming middleware. Since the maximum file size is restricted to 3MB (audio) and 8MB (images), the base64 payload size is well within acceptable serverless memory footprints.

### 2. Direct HTTP REST Requests to Supabase
We will not install the `@supabase/supabase-js` SDK on the backend. Instead, we will stream the decoded buffer directly to Supabase's Storage REST API endpoint:
`POST {SUPABASE_URL}/storage/v1/object/{bucket}/{filename}`
- **Headers**:
  - `Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}`
  - `Content-Type: {fileType}`
- **Rationale**: Minimizes dependencies and ensures compatibility across different serverless platforms.

### 3. File Naming Collision Mitigation
To prevent files uploaded by different users (or the same user uploading different files) from colliding or overwriting each other in the bucket, the server will prefix filenames with a unique UUID:
`const safeName = \`\${crypto.randomUUID()}-\${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}\`;`

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Missing Env Credentials | If `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is not present, the endpoint returns a clear `500 Internal Server Error` with details, warning the host to check project settings. |
| Vercel Timeout | Large uploads may exceed Vercel's execution time limit. Enforcing a strict 3MB limit for audio and 8MB for images ensures uploads finish within 2-3 seconds. |
| Orphaned Storage Objects | When a canvas is deleted or images are cleared, old files are not automatically deleted. This is standard storage behavior. A separate background cleanup cron can prune orphaned items if necessary. |
