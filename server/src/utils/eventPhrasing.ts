// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Event-type phrasing (server mirror of src/utils/eventPhrasing.ts)
// Reads shared/eventPhrasing.json — the same file the server uses for social
// previews — so titles read "Cumpleaños de Sofía", not "Matrimonio de Sofía".
// ─────────────────────────────────────────────────────────────────────────────

// Synced copy of ../../shared/eventPhrasing.json (npm run phrasing:sync at repo root); parity is asserted by tests.
import phrasingJson from '../../shared/eventPhrasing.json';
export type EventType = 'WEDDING' | 'BIRTHDAY' | 'BAPTISM' | 'CORPORATE' | 'CUSTOM';

export type PhrasingLang = 'ES' | 'EN';

export interface EventPhrasing {
  typeLabel: string;
  typeDescription: string;
  eventTitle: string;
  eventTitleNoHosts: string;
  connector: string;
  hostsLabel: string;
  hostsPlaceholder: string;
  inviteLine: string;
  notesPlaceholder: string;
  itineraryHeading: string;
  giftsHeading: string;
  dressCodeHeading: string;
  countdownHeading: string;
  rsvpHeading: string;
  songLine: string;
  titleAliases: string[];
}

const TABLE = phrasingJson as unknown as Record<EventType, Record<PhrasingLang, EventPhrasing>> & { _comment?: string };

export const PHRASING_KEYS: (keyof EventPhrasing)[] = [
  'typeLabel', 'typeDescription', 'eventTitle', 'eventTitleNoHosts', 'connector', 'hostsLabel',
  'hostsPlaceholder', 'inviteLine', 'notesPlaceholder', 'itineraryHeading', 'giftsHeading',
  'dressCodeHeading', 'countdownHeading', 'rsvpHeading', 'songLine', 'titleAliases',
];

export function normalizeEventType(value: unknown): EventType {
  return value === 'WEDDING' || value === 'BIRTHDAY' || value === 'BAPTISM' || value === 'CORPORATE' || value === 'CUSTOM'
    ? value
    : value == null
      ? 'WEDDING'
      : 'CUSTOM';
}

export function normalizeLang(lang?: string | null): PhrasingLang {
  return (lang || '').toUpperCase() === 'EN' ? 'EN' : 'ES';
}

export function getPhrasing(eventType: EventType | undefined, lang?: string | null): EventPhrasing {
  const type = normalizeEventType(eventType);
  return TABLE[type][normalizeLang(lang)];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** If `text` already matches this type's title pattern in any language, returns the bare hosts. */
function extractHosts(text: string, eventType: EventType): string | null {
  const type = normalizeEventType(eventType);
  for (const lang of ['ES', 'EN'] as PhrasingLang[]) {
    const pattern = TABLE[type][lang].eventTitle;
    if (!pattern.includes('{hosts}')) continue;
    const re = new RegExp('^' + escapeRegExp(pattern).replace('\\{hosts\\}', '(.+?)') + '$', 'i');
    const m = re.exec(text);
    if (m) return m[1].trim();
  }
  return null;
}

/**
 * "Matrimonio de Oscar & Rocio" / "Sofía's Birthday" / verbatim for corporate & custom.
 * A hosts string that already carries the other language's pattern is re-phrased
 * ("Matrimonio de X" → "X Wedding"); one that merely mentions an alias
 * ("Boda de Ana y Luis") is kept verbatim.
 */
export function formatEventTitleFor(
  hostNames: string | null | undefined,
  eventType: EventType | undefined,
  lang?: string | null,
): string {
  const p = getPhrasing(eventType, lang);
  const clean = (hostNames || '').trim();
  if (!clean) return p.eventTitleNoHosts;
  const extracted = extractHosts(clean, normalizeEventType(eventType));
  if (extracted !== null) return p.eventTitle.replace('{hosts}', extracted);
  const lower = clean.toLowerCase();
  if (p.titleAliases.some((a) => lower.includes(a))) return clean;
  return p.eventTitle.replace('{hosts}', clean);
}


const ES_FEMININE_TITLE_NOUNS = [
  'boda', 'fiesta', 'gala', 'conferencia', 'cena', 'reunión', 'reunion',
  'comunión', 'comunion', 'confirmación', 'confirmacion', 'ceremonia',
];

/**
 * Spanish preposition for "Invitación para <guest> <connector> <title>".
 * Uses the event type's connector, unless the title itself starts with a
 * feminine event noun ("Boda de…", "Gala…"), which takes "a la".
 */
export function spanishConnector(eventTitle: string, eventType: EventType | undefined): string {
  const lower = (eventTitle || '').trim().toLowerCase();
  if (ES_FEMININE_TITLE_NOUNS.some((n) => lower.startsWith(n))) return 'a la';
  return getPhrasing(eventType, 'ES').connector;
}

/** Replaces {hosts} in any phrasing string (e.g. notesPlaceholder). */
export function fillHosts(template: string, hostNames?: string | null): string {
  const clean = (hostNames || '').trim();
  return template.replace('{hosts}', clean || '');
}
