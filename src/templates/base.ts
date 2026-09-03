// Shared scaffolding for event templates. Each template fills in copy,
// itinerary, dress code, gifts, RSVP defaults and its section list.
import type {
  EventType,
  InvitationDesign,
  InvitationSection,
  ItineraryItem,
  RsvpFormConfig,
  SectionKind,
} from '../types/sigil.types';

export type TemplateLang = 'ES' | 'EN';

export interface EventTemplate {
  id: EventType;
  /** Creates a complete, already-normalised design for this event type. */
  createDesign: (lang: TemplateLang) => InvitationDesign;
}

/** Deterministic section ids so legacy migration and templates agree. */
export function section(kind: SectionKind, enabled = true, extra: Partial<InvitationSection> = {}): InvitationSection {
  return {
    id: `sec-${kind.toLowerCase()}`,
    kind,
    enabled,
    props: { kind } as InvitationSection['props'],
    ...extra,
  };
}

export const DEFAULT_RSVP: RsvpFormConfig = {
  requireMealPreference: false,
  requireDietaryRestrictions: false,
  allowPlusOnes: false,
  customNotesLabel: null,
  mealOptions: [],
};

/** A date roughly a year out, at 18:00 local — templates need *some* target. */
export function defaultCountdownTarget(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T18:00:00`;
}

export function itin(id: string, kind: ItineraryItem['kind'], title: string, locationName: string, time: string): ItineraryItem {
  return { id, kind, title, locationName, time, mapLink: 'https://maps.google.com' };
}

/** Everything that is identical across event types. */
export function baseDesign(eventType: EventType, lang: TemplateLang, headline: string): InvitationDesign {
  return {
    id: 'design-default',
    title: 'Untitled Invitation',
    eventType,
    paperTexture: 'parchment',
    paperLuminance: 'LIGHT',
    envelopeStyle: 'CLASSIC',
    textBlocks: [
      {
        id: 'tb-headline',
        content: headline,
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 2.2,
        fontStyle: 'italic',
        fontWeight: 400,
        color: 'DARK_INK',
        textAlign: 'center',
        letterSpacing: 0.04,
        lineHeight: 1.25,
        marginTop: 0,
      },
    ],
    borderStyle: 'deckled',
    backgroundColor: 'var(--paper-parchment)',
    rsvpFormConfig: { ...DEFAULT_RSVP },
    countdownTarget: defaultCountdownTarget(),
    itinerary: [],
    colorPalette: ['#4f5d47', '#a08e7c', '#4c4844', '#dfb88e', '#e8e5c8'],
    registryText: '',
    registryLink: '',
    registryImageScale: 100,
    closedEnvelopeImage: '',
    headerImageScale: 100,
    openedEnvelopeImage: '',
    openedEnvelopeImageScale: 100,
    stickerImage: '',
    sealSize: 75,
    musicUrl: '',
    paperSaturate: 1.0,
    language: lang,
    sections: [],
  };
}
