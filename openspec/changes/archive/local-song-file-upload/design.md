# Design — Local Song File Upload

## Architectural Decisions

### Decision 1: Base64 Data URL Encoding
**Choice**: Use `FileReader.readAsDataURL` to serialize the audio file as a base64 encoded string stored directly inside the design state JSON payload.
**Why**:
- Requires zero database schema updates or separate server storage endpoints.
- Plugs natively into the existing REST `/canvas` update endpoints.
- Fully compatible with HTML5 `new Audio(dataUrl)` initialized inside the `AudioEngine`.

### Decision 2: 12MB File Size Limit
**Choice**: Enforce a strict 12MB size limit on selected audio files.
**Why**:
- Ensures serialized JSON payloads remain within reasonable memory footprints and avoid database column sizing overflows while easily covering standard MP3 files (typical 3-minute MP3s are 3MB to 6MB).

---

## Risks & Mitigations

### Risk 1: Performance degradation on slow devices during JSON serialization
- **Risk**: Reading and serializing large files can temporarily block the main JavaScript thread.
- **Mitigation**: Using native asynchronous `FileReader` ensures the UI remains responsive, and the 12MB threshold bounds maximum thread overhead.
