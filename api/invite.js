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

  if (guest && guest.guestType === 'FAMILY') {
    const isEs = lang === 'ES';
    const lower = primaryName.toLowerCase();
    let baseName = primaryName;
    if (lower.startsWith('familia ')) {
      baseName = primaryName.slice(8).trim();
    } else if (lower.startsWith('the ')) {
      baseName = primaryName.slice(4).trim();
      if (baseName.toLowerCase().endsWith(' family')) {
        baseName = baseName.slice(0, -7).trim();
      }
    } else if (lower.endsWith(' family')) {
      baseName = primaryName.slice(0, -7).trim();
    }

    return isEs ? `Familia ${baseName}` : `${baseName} Family`;
  }

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

  let result = clean;

  if (isEs) {
    if (/^(wedding of)\s+/i.test(result)) {
      result = result.replace(/^(wedding of)\s+/i, 'Matrimonio de ');
    } else if (/\s+wedding$/i.test(result)) {
      const names = result.replace(/\s+wedding$/i, '').replace(/'s$/i, '').trim();
      result = `Matrimonio de ${names}`;
    } else if (!/^(matrimonio|boda)/i.test(result)) {
      result = `Matrimonio de ${result}`;
    }
  } else {
    // English translation -> "Marcos & Diana Wedding"
    if (/^(matrimonio de|boda de)\s+/i.test(result)) {
      const names = result.replace(/^(matrimonio de|boda de)\s+/i, '').trim();
      result = `${names} Wedding`;
    } else if (/^(matrimonio|boda)\s+/i.test(result)) {
      const names = result.replace(/^(matrimonio|boda)\s+/i, '').trim();
      result = `${names} Wedding`;
    } else if (!/(wedding|'s wedding)$/i.test(result) && !/^wedding of/i.test(result)) {
      result = `${result} Wedding`;
    }
  }

  return result;
}

export default async function handler(req, res) {
  let token = req.query ? req.query.token : undefined;
  if (!token && req.url) {
    try {
      const parsedUrl = new URL(req.url, 'https://sigil-and-script-frontend.vercel.app');
      token = parsedUrl.searchParams.get('token') || parsedUrl.pathname.split('/invite/')[1]?.split('?')[0];
    } catch (e) {
      const match = req.url.match(/[\?&]token=([^&]+)/) || req.url.match(/\/invite\/([^?]+)/);
      if (match) token = match[1];
    }
  }

  let guestObj = null;
  let rawHostNames = '';
  let lang = 'ES';
  let ogImage = 'https://sigil-and-script-frontend.vercel.app/envelope-with-seal.png';

  if (token && token.length > 10) {
    try {
      const apiRes = await fetch(`https://sigil-and-script-backend.vercel.app/invite/${token}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SigilFrontend/1.0',
        },
      });
      if (apiRes.ok) {
        guestObj = await apiRes.json();
        if (guestObj) {
          if (guestObj.language && typeof guestObj.language === 'string' && guestObj.language.trim()) {
            lang = guestObj.language.trim().toUpperCase();
          }
          if (guestObj.canvas && guestObj.canvas.designData) {
            const data = typeof guestObj.canvas.designData === 'string' ? JSON.parse(guestObj.canvas.designData) : guestObj.canvas.designData;
            if ((!guestObj.language || !guestObj.language.trim()) && data.language && typeof data.language === 'string') {
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
