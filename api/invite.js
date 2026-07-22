function isSocialCrawler(ua) {
  if (!ua) return false;
  const crawlers = [
    'whatsapp', 'facebookexternalhit', 'twitterbot', 'telegrambot',
    'slackbot', 'linkedinbot', 'applebot', 'discordbot', 'bingbot', 'googlebot'
  ];
  const lower = ua.toLowerCase();
  return crawlers.some((c) => lower.includes(c));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  const token = req.query.token || (req.url || '').split('/invite/')[1]?.split('?')[0];
  const userAgent = req.headers['user-agent'] || '';
  const acceptsHtml = (req.headers.accept || '').includes('text/html');

  let guestName = '';
  let eventTitle = '';
  let lang = 'ES';
  let ogImage = 'https://sigil-and-script-frontend.vercel.app/envelope-with-seal.png';

  if (token && token.length > 10) {
    try {
      const apiRes = await fetch(`https://sigil-and-script-backend.vercel.app/invite/${token}`);
      if (apiRes.ok) {
        const guest = await apiRes.json();
        if (guest && guest.name) {
          guestName = guest.name.trim();
        }
        if (guest && guest.canvas && guest.canvas.designData) {
          const data = typeof guest.canvas.designData === 'string' ? JSON.parse(guest.canvas.designData) : guest.canvas.designData;
          if (data.language && typeof data.language === 'string') {
            lang = data.language.trim().toUpperCase();
          }
          if (data.hostNames && typeof data.hostNames === 'string' && data.hostNames.trim()) {
            eventTitle = data.hostNames.trim();
          } else if (Array.isArray(data.textBlocks)) {
            const headline = data.textBlocks.find((b) => b.id === 'tb-headline' || b.id === 'tb-title');
            if (headline && headline.content) {
              eventTitle = headline.content.trim();
            }
          }
          if (data.closedEnvelopeImage && typeof data.closedEnvelopeImage === 'string' && data.closedEnvelopeImage.startsWith('http') && !data.closedEnvelopeImage.endsWith('.svg')) {
            ogImage = data.closedEnvelopeImage;
          }
        }
      }
    } catch (e) {
      console.error('Error fetching invite details in Vercel function:', e);
    }
  }

  let ogTitle = '';
  let ogDesc = '';

  if (lang === 'ES') {
    if (guestName && eventTitle) {
      ogTitle = `Invitación para ${guestName} a ${eventTitle}`;
    } else if (guestName) {
      ogTitle = `Invitación para ${guestName}`;
    } else if (eventTitle) {
      ogTitle = `Invitación a ${eventTitle}`;
    } else {
      ogTitle = `Invitación al Evento`;
    }
    ogDesc = 'Toca para abrir tu invitación digital personalizada.';
  } else {
    if (guestName && eventTitle) {
      ogTitle = `Invitation for ${guestName} to ${eventTitle}`;
    } else if (guestName) {
      ogTitle = `Invitation for ${guestName}`;
    } else if (eventTitle) {
      ogTitle = `Invitation to ${eventTitle}`;
    } else {
      ogTitle = `Invitation to Event`;
    }
    ogDesc = 'Tap to unseal your personalized digital stationery invitation.';
  }

  const frontendUrl = `https://sigil-and-script-frontend.vercel.app/invite/${token || ''}`;

  if (isSocialCrawler(userAgent) || acceptsHtml) {
    const html = `<!DOCTYPE html>
<html lang="${lang === 'ES' ? 'es' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(ogTitle)}</title>
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDesc)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(frontendUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDesc)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
</head>
<body>
  <p>Redirecting to invitation...</p>
  <script>window.location.href = "${escapeHtml(frontendUrl)}";</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  return res.redirect(302, frontendUrl);
}
