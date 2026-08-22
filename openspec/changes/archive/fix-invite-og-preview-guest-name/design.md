# Design: Fix Invitee Name Missing in Social Link Previews

## Architectural Decisions

1. **Explicit Content Negotiation in Serverless Proxy (`api/invite.js`)**:
   - Vercel functions acting as proxy/BFF must explicitly declare `Accept: application/json` and a distinct internal `User-Agent` (e.g. `SigilFrontend/1.0`) when querying internal backend APIs.
   - This prevents header leak/forwarding where incoming user-agent strings cause downstream internal endpoints to alter their return content-type from JSON to HTML.

2. **Backend Header Precedence in `inviteController.ts`**:
   - If an incoming request to `/invite/:token` explicitly sets `Accept: application/json`, the JSON endpoint handler takes precedence over the social crawler HTML generator.
   - Social crawler HTML generation only triggers when `Accept: text/html` is requested OR when `Accept` does not contain `application/json`.

3. **Resilient Token Extraction**:
   - Parse `token` with `new URL(req.url, 'http://localhost').searchParams.get('token')` as fallback alongside `req.query?.token` and `req.url` regex matching.

## Risks & Mitigations

- **Risk**: Backend still returns HTML if `Accept` header is omitted by third-party tools.
  - **Mitigation**: Setting both `Accept: application/json` and custom `User-Agent: SigilFrontend/1.0` in `api/invite.js` ensures 100% reliable JSON response from backend.
- **Risk**: Regression in normal social link previews.
  - **Mitigation**: `api/invite.js` continues to format rich HTML with OpenGraph tags for social crawlers accessing `https://sigil-and-script-frontend.vercel.app/invite/<token>`.
