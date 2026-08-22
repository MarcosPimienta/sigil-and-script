# Proposal: Fix Invitee Name Missing in Social Link Previews

## Problem
When an invitation link (`https://sigil-and-script-frontend.vercel.app/invite/<token>`) is shared on WhatsApp, Facebook, or other social crawlers, the link preview displays `"Invitación para Invitado al Matrimonio"` instead of the actual invitee name (e.g. `"Invitación para Julian Hernandez al Matrimonio de Marcos & Diana"`).

### Root Causes
1. **User-Agent Header Forwarding & Content Negotiation Conflict**: `api/invite.js` makes a server-side `fetch` to backend `https://sigil-and-script-backend.vercel.app/invite/<token>`. Because Vercel forwards the incoming request's `User-Agent: WhatsApp/...` header without `api/invite.js` specifying an explicit `Accept: application/json` header, the backend's `inviteController.ts` sees `isSocialCrawler(userAgent) === true` and responds with an HTML page (`text/html`) instead of JSON (`application/json`).
2. **JSON SyntaxError Catch & Fallback to Default Name**: `api/invite.js` attempts `await apiRes.json()`, which fails with a `SyntaxError` when trying to parse HTML as JSON. The exception is caught, leaving `guestObj` as `null` and defaulting `formatGuestTitleName(null, 'ES')` to `'Invitado'`.
3. **URL Token Extraction Vulnerability**: Token parsing in `api/invite.js` uses `.split('/invite/')[1]`, which yields `undefined` when `req.url` is rewritten to `/api/invite?token=...` if `req.query` is unparsed.

## Proposed Solution
1. **Frontend Serverless Function (`api/invite.js`)**:
   - Explicitly pass `{ 'Accept': 'application/json', 'User-Agent': 'SigilFrontend/1.0' }` when fetching backend invite JSON so backend always returns JSON to `api/invite.js`.
   - Parse `token` robustly from `req.query.token` or URL search parameters / pathname.
2. **Backend Controller (`server/src/controllers/inviteController.ts`)**:
   - Check if `req.headers.accept?.includes('application/json')` before triggering the HTML social crawler override, ensuring clients requesting JSON receive JSON.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `api/invite.js` | Modify | Pass explicit `Accept: application/json` header during fetch, improve token extraction |
| `server/src/controllers/inviteController.ts` | Modify | Ensure backend returns JSON when `Accept: application/json` is specified, even for social user agents |

## Scope Constraints
- In Scope: Open Graph tag generation for social crawler link previews and JSON payload retrieval.
- Out of Scope: Direct browser navigation redirect logic.
