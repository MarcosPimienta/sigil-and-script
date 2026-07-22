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

function extractDependentsFromGuest(guest) {
  if (!guest) return [];

  // 1. Check direct guest.dependents
  if (guest.dependents) {
    let deps = guest.dependents;
    if (typeof deps === 'string') {
      try { deps = JSON.parse(deps); } catch (e) {}
    }
    if (Array.isArray(deps)) return deps;
  }

  // 2. Check guest.formResponses (where Prisma stores JSON serialized form responses)
  if (guest.formResponses) {
    let resp = guest.formResponses;
    if (typeof resp === 'string') {
      try { resp = JSON.parse(resp); } catch (e) {}
    }
    if (resp && typeof resp === 'object' && Array.isArray(resp.dependents)) {
      return resp.dependents;
    }
  }

  // 3. Fallback to guest.additionalGuests
  if (guest.additionalGuests) {
    let add = guest.additionalGuests;
    if (typeof add === 'string') {
      try { add = JSON.parse(add); } catch (e) {}
    }
    if (Array.isArray(add)) return add;
  }

  return [];
}

function formatGuestTitleName(guest, lang) {
  const primaryName = (guest && (guest.name || guest.guestName) ? (guest.name || guest.guestName) : '').trim();
  if (!primaryName) return lang === 'ES' ? 'Invitado' : 'Guest';

  const rawDeps = extractDependentsFromGuest(guest);
  const dependentNames = rawDeps
    .filter((d) => d && (d.included === undefined || d.included === true))
    .map((d) => (typeof d === 'string' ? d : d.name))
    .filter((n) => typeof n === 'string' && n.trim().length > 0);

  if (dependentNames.length === 0) {
    return primaryName;
  }

  if (dependentNames.length === 1) {
    const connector = lang === 'ES' ? 'y' : '&';
    return `${primaryName} ${connector} ${dependentNames[0].trim()}`;
  }

  const familyTag = lang === 'ES' ? 'y Familia' : '& Family';
  return `${primaryName} ${familyTag}`;
}

function formatEventTitle(hostNames, lang) {
  const clean = (hostNames || '').trim();
  const isEs = lang === 'ES';

  if (!clean) {
    return isEs ? 'Matrimonio' : 'Wedding';
  }

  const lower = clean.toLowerCase();
  if (lower.startsWith('matrimonio') || lower.startsWith('boda') || lower.startsWith('wedding')) {
    return clean;
  }

  return isEs ? `Matrimonio de ${clean}` : `Wedding of ${clean}`;
}

export default async function handler(req, res) {
  const token = req.query.token || (req.url || '').split('/invite/')[1]?.split('?')[0];

  let guestObj = null;
  let rawHostNames = '';
  let lang = 'ES';
  let ogImage = 'https://sigil-and-script-frontend.vercel.app/envelope-with-seal.png';

  if (token && token.length > 10) {
    try {
      const apiRes = await fetch(`https://sigil-and-script-backend.vercel.app/invite/${token}`);
      if (apiRes.ok) {
        guestObj = await apiRes.json();
        if (guestObj && guestObj.canvas && guestObj.canvas.designData) {
          const data = typeof guestObj.canvas.designData === 'string' ? JSON.parse(guestObj.canvas.designData) : guestObj.canvas.designData;
          if (data.language && typeof data.language === 'string') {
            lang = data.language.trim().toUpperCase();
          }
          if (data.hostNames && typeof data.hostNames === 'string' && data.hostNames.trim()) {
            rawHostNames = data.hostNames.trim();
          } else if (data.title && typeof data.title === 'string' && data.title.trim()) {
            rawHostNames = data.title.trim();
          } else if (Array.isArray(data.textBlocks)) {
            const headline = data.textBlocks.find((b) => b.id === 'tb-headline' || b.id === 'tb-title');
            if (headline && headline.content) {
              rawHostNames = headline.content.trim();
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

  const guestTitleName = formatGuestTitleName(guestObj, lang);
  const eventTitle = formatEventTitle(rawHostNames, lang);

  let ogTitle = '';
  let ogDesc = '';

  if (lang === 'ES') {
    const lowerEv = eventTitle.toLowerCase();
    const connector = lowerEv.startsWith('matrimonio') || lowerEv.startsWith('boda') ? 'al' : 'a';
    ogTitle = `Invitación para ${guestTitleName} ${connector} ${eventTitle}`;
    ogDesc = 'Toca para abrir tu invitación digital personalizada.';
  } else {
    ogTitle = `Invitation for ${guestTitleName} to ${eventTitle}`;
    ogDesc = 'Tap to open your personalized digital invitation.';
  }

  const siteUrl = `https://sigil-and-script-frontend.vercel.app/invite/${token || ''}`;

  const html = `<!DOCTYPE html>
<html lang="${lang.toLowerCase()}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="description" content="${escapeHtml(ogDesc)}" />

  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(siteUrl)}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDesc)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Sigil &amp; Script" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${escapeHtml(siteUrl)}" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDesc)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />

  <meta http-equiv="refresh" content="0;url=${escapeHtml(siteUrl)}" />
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(siteUrl)}">${escapeHtml(ogTitle)}</a>...</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).send(html);
}
