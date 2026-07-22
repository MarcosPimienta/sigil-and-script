# Technical Design: Supabase Bucket SVG Upload Support

## Architectural Decisions

1. **MIME Type Strategy for Supabase Storage**:
   - Supabase Storage buckets enforce strict MIME type filters on `image/svg+xml`.
   - By transmitting SVG binary payloads with `Content-Type: application/octet-stream`, Supabase Storage accepts the asset without triggering 415 `invalid_mime_type`.
   - Browsers render the returned `publicUrl` in `<img>` tags and `SvgColorImage.tsx` without issue.
