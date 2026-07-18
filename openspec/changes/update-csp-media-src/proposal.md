# Proposal — Update CSP Media-Src

## Problem
When a user loads or streams local base64 audio data URLs, the browser blocks the action because the meta tag CSP falls back to `default-src 'self'`, which doesn't permit `data:`, `blob:`, or external HTTP/HTTPS audio links.

## Proposed Solution
1. Add an explicit `media-src` directive to the CSP meta header in [index.html](file:///home/fenix3819/sigil-and-script/index.html):
   `media-src 'self' data: blob: https:;`
   This allows playing local MP3 files, base64 data URLs, blob instances, and external secure audio streams.

---

## Files to Modify

| File | Change |
|---|---|
| `index.html` | Update Content-Security-Policy meta content attribute. |

---

## Scope Constraints

- **In-Scope**:
  - Updating front-end CSP definitions to permit media streaming sources.
- **Out-of-Scope**:
  - Editing third-party script/image policies.
