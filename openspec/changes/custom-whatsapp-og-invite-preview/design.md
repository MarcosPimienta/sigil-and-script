# Technical Design: Custom WhatsApp & Social Media Open Graph Invite Previews

## Architectural Decisions

1. **Crawler Detection & Server-Side Open Graph HTML**:
   - Social link crawlers (WhatsApp, FacebookExternalHit, Twitterbot, TelegramBot, Slackbot, LinkedInBot) inspect raw HTML `<head>` tags without running client JavaScript.
   - For GET `/invite/:token` requests with `Accept: text/html` or social crawler User-Agent headers, the server responds with a lightweight HTML document containing pre-rendered `<meta property="og:title">`, `<meta property="og:image">`, and `<meta property="og:description">` tags.
   - Browser requests return client redirect script to `https://sigil-and-script-frontend.vercel.app/invite/:token`.

2. **Title Template**:
   - `Invitation for ${guestName} to ${eventTitle}`
   - Fallback when title is empty: `Invitation for ${guestName}` or `Invitation to ${eventTitle}`.

3. **Thumbnail Image (`og:image`)**:
   - Closed envelope asset URL (e.g. `closedEnvelopeImage` from `designData` or absolute fallback URL `https://sigil-and-script-frontend.vercel.app/icons/letter-envelope.svg`).
