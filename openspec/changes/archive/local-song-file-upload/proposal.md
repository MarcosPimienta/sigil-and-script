# Proposal — Local Song File Upload

## Problem
Hosts want to be able to upload a local audio file (MP3, WAV, M4A) directly from their system rather than having to supply a hosted HTTPS URL link to play background music.

## Proposed Solution
1. **Audio File Selection input**: In [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx), implement a new helper component `AudioUploadSlot` that utilizes a hidden file input allowing users to select local audio files from their device.
2. **Convert to base64 Data URL**: Read the uploaded audio file client-side as a base64 Data URL using `FileReader`, and save it in `design.musicUrl` (fitting directly into our existing save/load flows).
3. **MIME type and size validation**: Validate the file to ensure it is of type audio and under 12MB.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/LeftPanel.tsx` | Add `AudioUploadSlot`, callbacks `handleAudioUpload` and `handleAudioClear`, and replace the URL text input block with the new upload slot. |

---

## Scope Constraints

- **In-Scope**:
  - Direct local audio file selection using browser file picker.
  - Converting local file to base64 URL.
  - Displaying preview file names or badges when loaded.
- **Out-of-Scope**:
  - Server-side multipart file uploads (relying on client-side JSON/data URL serialization).
