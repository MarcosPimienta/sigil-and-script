export interface GuestLike {
  name?: string;
  guestName?: string;
  guestType?: string;
  dependents?: Array<{ name: string; included?: boolean }> | string;
  formResponses?: { dependents?: Array<{ name: string; included?: boolean }> } | string;
  additionalGuests?: Array<string | { name: string; included?: boolean }> | string;
}

export function extractDependentsFromGuest(guest?: GuestLike | null): Array<{ name: string; included?: boolean }> {
  if (!guest) return [];

  // 1. Check direct guest.dependents
  if (guest.dependents) {
    let deps = guest.dependents;
    if (typeof deps === 'string') {
      try {
        deps = JSON.parse(deps);
      } catch {
        // ignore parse error
      }
    }
    if (Array.isArray(deps)) return deps;
  }

  // 2. Check guest.formResponses (where Prisma stores JSON serialized form responses)
  if (guest.formResponses) {
    let resp = guest.formResponses;
    if (typeof resp === 'string') {
      try {
        resp = JSON.parse(resp);
      } catch {
        // ignore parse error
      }
    }
    if (resp && typeof resp === 'object' && Array.isArray((resp as any).dependents)) {
      return (resp as any).dependents;
    }
  }

  // 3. Fallback to guest.additionalGuests
  if (guest.additionalGuests) {
    let add = guest.additionalGuests;
    if (typeof add === 'string') {
      try {
        add = JSON.parse(add);
      } catch {
        // ignore parse error
      }
    }
    if (Array.isArray(add)) {
      return add.map((item) => (typeof item === 'string' ? { name: item, included: true } : item));
    }
  }

  return [];
}

export function formatGuestTitleName(guest?: GuestLike | null, lang: string = 'ES'): string {
  const primaryName = (guest?.name || guest?.guestName || '').trim();
  if (!primaryName) return lang.toUpperCase() === 'ES' ? 'Invitado' : 'Guest';

  const isEs = lang.toUpperCase() === 'ES';

  if (guest?.guestType === 'FAMILY') {
    const lower = primaryName.toLowerCase();
    if (lower.startsWith('familia') || lower.startsWith('the ') || lower.endsWith(' family')) {
      return primaryName;
    }
    return isEs ? `Familia ${primaryName}` : `The ${primaryName} Family`;
  }

  const rawDeps = extractDependentsFromGuest(guest);
  const dependentNames = rawDeps
    .filter((d: any) => d && (d.included === undefined || d.included === true))
    .map((d: any) => (typeof d === 'string' ? d : d.name))
    .filter((n: any) => typeof n === 'string' && n.trim().length > 0);

  if (dependentNames.length === 0) {
    return primaryName;
  }

  if (dependentNames.length === 1) {
    const connector = isEs ? 'y' : '&';
    return `${primaryName} ${connector} ${dependentNames[0].trim()}`;
  }

  const familyTag = isEs ? 'y Familia' : '& Family';
  return `${primaryName} ${familyTag}`;
}

export function formatEventTitle(hostNames?: string | null, lang: string = 'ES'): string {
  const clean = (hostNames || '').trim();
  const isEs = lang.toUpperCase() === 'ES';

  if (!clean) {
    return isEs ? 'Matrimonio' : 'Wedding';
  }

  let result = clean;
  if (isEs) {
    if (/^(wedding of|wedding)\s+/i.test(result)) {
      result = result.replace(/^(wedding of|wedding)\s+/i, 'Matrimonio de ');
    } else if (!/^(matrimonio|boda)/i.test(result)) {
      result = `Matrimonio de ${result}`;
    }
  } else {
    if (/^(matrimonio de|boda de)\s+/i.test(result)) {
      result = result.replace(/^(matrimonio de|boda de)\s+/i, 'Wedding of ');
    } else if (/^(matrimonio|boda)\s+/i.test(result)) {
      result = result.replace(/^(matrimonio|boda)\s+/i, 'Wedding ');
    } else if (!/^wedding/i.test(result)) {
      result = `Wedding of ${result}`;
    }
  }

  return result;
}

export function formatFullInvitationTitle(
  guest?: GuestLike | null,
  hostNames?: string | null,
  lang: string = 'ES'
): string {
  const guestTitle = formatGuestTitleName(guest, lang);
  const eventTitle = formatEventTitle(hostNames, lang);
  const isEs = lang.toUpperCase() === 'ES';

  if (isEs) {
    const lowerEv = eventTitle.toLowerCase();
    const connector = lowerEv.startsWith('matrimonio') || lowerEv.startsWith('boda') ? 'al' : 'a';
    return `Invitación para ${guestTitle} ${connector} ${eventTitle}`;
  }

  return `Invitation for ${guestTitle} to ${eventTitle}`;
}
