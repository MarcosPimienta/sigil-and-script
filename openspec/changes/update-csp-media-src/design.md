# Design — Update CSP Media-Src

## Architectural Decisions

### Decision 1: Explicit media-src Policy
**Choice**: Declare `media-src 'self' data: blob: https:;` in the meta CSP header.
**Why**:
- Resolves the blocked `data:audio/mpeg;base64` loading error by explicitly authorising base64 encoded local audio payloads.
- Authorises fallback local file playback and HTTPS secure streams.

---

## Risks & Mitigations

### Risk 1: Over-permission of media-src
- **Risk**: Allowing `https:` enables streaming audio from arbitrary remote sites.
- **Mitigation**: Audio nodes are strictly passive and cannot execute script payloads in modern browsers, maintaining strong defense-in-depth security.
