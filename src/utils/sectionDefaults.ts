// ─────────────────────────────────────────────────────────────────────────────
// Section catalogue — labels, icons, descriptions and default props per kind.
// Used by the "Add section" palette, the sections list and the store's
// addSection action. Pure data + pure functions (no DOM, no React).
// ─────────────────────────────────────────────────────────────────────────────

import type {
  IconId,
  InvitationSection,
  SectionKind,
  SectionProps,
  VideoProvider,
} from '../types/sigil.types';
import { SINGLETON_SECTION_KINDS } from '../types/sigil.types';

export type SectionLang = 'ES' | 'EN';

export interface SectionKindMeta {
  kind: SectionKind;
  icon: IconId;
  label: Record<SectionLang, string>;
  description: Record<SectionLang, string>;
  /** Only one allowed per invitation. */
  singleton: boolean;
}

export const SECTION_CATALOGUE: SectionKindMeta[] = [
  {
    kind: 'TEXT',
    icon: 'sparkle',
    label: { ES: 'Texto', EN: 'Text' },
    description: { ES: 'Un párrafo libre en cualquier parte de la invitación.', EN: 'A free paragraph anywhere in the invitation.' },
    singleton: false,
  },
  {
    kind: 'IMAGE',
    icon: 'pin',
    label: { ES: 'Imagen', EN: 'Image' },
    description: { ES: 'Una foto o ilustración centrada, con pie opcional.', EN: 'A centred photo or illustration, with an optional caption.' },
    singleton: false,
  },
  {
    kind: 'VIDEO',
    icon: 'play',
    label: { ES: 'Video', EN: 'Video' },
    description: { ES: 'Un clip corto (mp4/webm) o un enlace de YouTube o Vimeo.', EN: 'A short clip (mp4/webm) or a YouTube or Vimeo link.' },
    singleton: false,
  },
  {
    kind: 'AUDIO',
    icon: 'music',
    label: { ES: 'Música', EN: 'Music' },
    description: { ES: 'Reproductor de la canción del evento. Solo uno por invitación.', EN: 'The event song player. Only one per invitation.' },
    singleton: true,
  },
  {
    kind: 'COUNTDOWN',
    icon: 'candle',
    label: { ES: 'Cuenta regresiva', EN: 'Countdown' },
    description: { ES: 'Días, horas y minutos hasta la fecha del evento.', EN: 'Days, hours and minutes until the event date.' },
    singleton: false,
  },
  {
    kind: 'ITINERARY',
    icon: 'church',
    label: { ES: 'Programa', EN: 'Programme' },
    description: { ES: 'La lista de momentos del evento, con lugar y hora.', EN: 'The list of event moments, with venue and time.' },
    singleton: false,
  },
  {
    kind: 'DRESS_CODE',
    icon: 'suit',
    label: { ES: 'Código de vestimenta', EN: 'Dress code' },
    description: { ES: 'Uno o varios grupos con su vestimenta y colores a evitar.', EN: 'One or more groups with attire and colours to avoid.' },
    singleton: false,
  },
  {
    kind: 'GIFTS',
    icon: 'gift',
    label: { ES: 'Regalos', EN: 'Gifts' },
    description: { ES: 'Mensaje de regalos, enlace a la mesa o lista de deseos.', EN: 'Gift message, registry link or wishlist.' },
    singleton: false,
  },
  {
    kind: 'RSVP',
    icon: 'badge',
    label: { ES: 'Confirmación (RSVP)', EN: 'RSVP form' },
    description: { ES: 'El formulario donde los invitados confirman asistencia.', EN: 'The form where guests confirm attendance.' },
    singleton: false,
  },
  {
    kind: 'DIVIDER',
    icon: 'sparkle',
    label: { ES: 'Separador', EN: 'Divider' },
    description: { ES: 'Un adorno para separar dos secciones.', EN: 'An ornament separating two sections.' },
    singleton: false,
  },
];

export function getSectionMeta(kind: SectionKind): SectionKindMeta {
  return SECTION_CATALOGUE.find((m) => m.kind === kind) ?? SECTION_CATALOGUE[0];
}

export function isSingletonKind(kind: SectionKind): boolean {
  return SINGLETON_SECTION_KINDS.includes(kind);
}

/** Default props for a newly added section of `kind`. */
export function defaultPropsFor(kind: SectionKind, lang: SectionLang = 'ES'): SectionProps {
  switch (kind) {
    case 'TEXT':
      return {
        kind: 'TEXT',
        content: lang === 'EN' ? 'Write your message here.' : 'Escribe tu mensaje aquí.',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 1.15,
        fontStyle: 'italic',
        color: 'DARK_INK',
        textAlign: 'center',
      };
    case 'IMAGE':
      return { kind: 'IMAGE', src: '', scale: 100 };
    case 'VIDEO':
      return { kind: 'VIDEO', src: '', provider: 'FILE' };
    case 'DIVIDER':
      return { kind: 'DIVIDER', ornament: 'flourish' };
    default:
      return { kind } as SectionProps;
  }
}

let seq = 0;
export function newSectionId(kind: SectionKind): string {
  seq += 1;
  return `sec-${kind.toLowerCase()}-${Date.now().toString(36)}-${seq}`;
}

export function createSection(kind: SectionKind, lang: SectionLang = 'ES'): InvitationSection {
  return { id: newSectionId(kind), kind, enabled: true, props: defaultPropsFor(kind, lang) };
}

// ── Video source parsing ─────────────────────────────────────────────────────

export const MAX_VIDEO_BYTES = 7 * 1024 * 1024; // matches the JSON upload ceiling
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export interface ParsedVideo {
  provider: VideoProvider;
  /** For FILE this is the media URL; for embeds it is the provider's video id. */
  src: string;
}

/**
 * Recognises YouTube (watch, youtu.be, shorts, embed), Vimeo, and direct
 * .mp4/.webm URLs (including Supabase storage links with query strings).
 * Returns null when the URL is not usable as a video source.
 */
export function parseVideoUrl(rawUrl: string): ParsedVideo | null {
  const url = (rawUrl || '').trim();
  if (!url) return null;

  if (url.startsWith('data:video/') || url.startsWith('blob:')) {
    return { provider: 'FILE', src: url };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const v = parsed.searchParams.get('v');
    if (v) return { provider: 'YOUTUBE', src: v };
    const m = /^\/(?:embed|shorts|v|live)\/([A-Za-z0-9_-]{6,})/.exec(parsed.pathname);
    if (m) return { provider: 'YOUTUBE', src: m[1] };
    return null;
  }
  if (host === 'youtu.be') {
    const id = parsed.pathname.replace(/^\//, '').split('/')[0];
    return id ? { provider: 'YOUTUBE', src: id } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = /(\d{6,})/.exec(parsed.pathname);
    return m ? { provider: 'VIMEO', src: m[1] } : null;
  }

  if (/\.(mp4|webm|mov|m4v)$/i.test(parsed.pathname)) {
    return { provider: 'FILE', src: url };
  }

  return null;
}

export function videoEmbedUrl(provider: VideoProvider, src: string): string {
  if (provider === 'YOUTUBE') {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(src)}?rel=0&playsinline=1`;
  }
  if (provider === 'VIMEO') {
    return `https://player.vimeo.com/video/${encodeURIComponent(src)}?dnt=1`;
  }
  return src;
}
