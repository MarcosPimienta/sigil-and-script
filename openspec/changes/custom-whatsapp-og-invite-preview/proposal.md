# Proposal: Custom WhatsApp & Social Media Open Graph Invite Previews

## Problem
When sharing invitation URLs (`https://sigil-and-script-frontend.vercel.app/invite/:token`) on WhatsApp, iMessage, Telegram, or Facebook, the link preview unfurls as a generic system card ("Sigil — Premium Digital Invitation Designer") rather than displaying the recipient's name and closed envelope preview image.

## Proposed Solution
1. **Dynamic HTML Open Graph Meta Tags Endpoint ([inviteController.ts](file:///home/fenix3819/sigil-and-script/server/src/controllers/inviteController.ts))**:
   - Implement `getInviteOgHtml` handler in the backend server for `/invite/:token` GET requests.
   - Look up the invitation token to retrieve guest name (`guest.name`) and event title (`hostNames`).
   - Populate Open Graph tags:
     - `og:title`: `Invitation for [Guest Name] to [Event Name]`
     - `og:description`: `Tap to unseal your personalized digital stationery invitation.`
     - `og:image`: The closed envelope image asset URL.
   - Serve dynamic HTML to social crawlers (WhatsApp, Facebook, Twitter, Telegram, Slack, iMessage) and redirect browsers to the frontend interactive SPA.
2. **Frontend Default Open Graph Meta Fallback ([index.html](file:///home/fenix3819/sigil-and-script/index.html))**:
   - Add static `<meta property="og:title">`, `<meta property="og:description">`, and `<meta property="og:image">` tags pointing to the closed envelope icon.

## Files to Create & Modify
| File | Action | Purpose |
| --- | --- | --- |
| `server/src/controllers/inviteController.ts` | Modify | Add `getInviteOgHtml` handler serving dynamic HTML meta tags |
| `server/src/routes/invite.ts` | Modify | Register HTML meta rendering for GET `/invite/:token` |
| `index.html` | Modify | Add static Open Graph fallback tags for closed envelope |

## Scope Constraints
- In Scope: Open Graph title formatting (`Invitation for [Guest Name] to [Event Name]`), thumbnail assignment to closed envelope, social crawler support for WhatsApp/iMessage/Telegram.
- Out of Scope: Non-invitation URL sharing metadata.
