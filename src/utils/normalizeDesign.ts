// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Design normaliser
// Pure, idempotent. Upgrades any persisted design (legacy wedding-era or
// current) to the event-type + sections shape. Runs whenever a design enters
// the store and before save. See openspec/changes/event-types-and-section-builder.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  DressCodeConfig,
  DressCodeGroup,
  InvitationDesign,
  InvitationSection,
  ItineraryItem,
  ItineraryKind,
  SectionKind,
} from '../types/sigil.types';
import { normalizeEventType } from './eventPhrasing';

/** Order the legacy renderer used — kept as the migration order. */
export const LEGACY_SECTION_ORDER: SectionKind[] = [
  'AUDIO', 'COUNTDOWN', 'ITINERARY', 'DRESS_CODE', 'GIFTS', 'RSVP',
];

/** Previous fixed banquet menu, supplied only for legacy designs that had meal choice on. */
export const LEGACY_MEAL_OPTIONS = {
  ES: ['Lomo de Res a la Parrilla', 'Salmón del Atlántico', 'Risotto de Hongos Silvestres'],
  EN: ['Prime Beef Tenderloin', 'Atlantic Salmon', 'Truffle Wild Mushroom Risotto'],
};

let counter = 0;
function newId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

/** The one place title keywords are still inspected — for legacy items without a kind. */
export function inferItineraryKind(title: string): ItineraryKind {
  const t = (title || '').toLowerCase();
  if (t.includes('ceremon')) return 'CEREMONY';
  if (t.includes('recepci') || t.includes('reception')) return 'RECEPTION';
  if (t.includes('fiesta') || t.includes('party') || t.includes('brindis')) return 'PARTY';
  if (t.includes('cena') || t.includes('dinner') || t.includes('almuerzo') || t.includes('lunch')) return 'DINNER';
  if (t.includes('charla') || t.includes('conferencia') || t.includes('talk') || t.includes('keynote')) return 'TALK';
  return 'CUSTOM';
}

function normalizeItinerary(items: ItineraryItem[] | undefined): ItineraryItem[] {
  return (items || []).map((it) => ({
    ...it,
    kind: it.kind ?? inferItineraryKind(it.title),
  }));
}

function migrateDressCode(d: InvitationDesign): DressCodeConfig | undefined {
  if (d.dressCode) {
    return { intro: d.dressCode.intro, groups: d.dressCode.groups ?? [] };
  }
  const groups: DressCodeGroup[] = [];
  const hasMale = d.dressCodeMaleHeading || d.dressCodeMaleText;
  const hasFemale = d.dressCodeFemaleHeading || d.dressCodeFemaleText;
  if (hasMale) {
    groups.push({
      id: 'dc-male',
      label: d.dressCodeMaleHeading || '',
      text: d.dressCodeMaleText || '',
      subtext: d.dressCodeMaleSubtext || undefined,
      avoidColors: d.dressCodeMaleAvoidColors?.length ? [...d.dressCodeMaleAvoidColors] : undefined,
      icon: 'suit',
    });
  }
  if (hasFemale) {
    groups.push({
      id: 'dc-female',
      label: d.dressCodeFemaleHeading || '',
      text: d.dressCodeFemaleText || '',
      subtext: d.dressCodeFemaleSubtext || undefined,
      avoidColors: d.dressCodeFemaleAvoidColors?.length ? [...d.dressCodeFemaleAvoidColors] : undefined,
      icon: 'dress',
    });
  }
  if (!d.dressCodeText && groups.length === 0) return undefined;
  return { intro: d.dressCodeText || undefined, groups };
}

/** Visibility rules the legacy renderer applied implicitly. */
function legacyEnabled(kind: SectionKind, d: InvitationDesign, dressCode: DressCodeConfig | undefined): boolean {
  switch (kind) {
    case 'AUDIO': return true; // AudioControls renders nothing without a musicUrl
    case 'COUNTDOWN': return true;
    case 'ITINERARY': return true; // renders null when empty
    case 'DRESS_CODE': return !!dressCode && (!!dressCode.intro || dressCode.groups.length > 0);
    case 'GIFTS': return !!(d.registryText || d.registryLink || d.registryImage);
    case 'RSVP': return true;
    default: return true;
  }
}

function buildLegacySections(d: InvitationDesign, dressCode: DressCodeConfig | undefined): InvitationSection[] {
  return LEGACY_SECTION_ORDER.map((kind) => ({
    id: `sec-${kind.toLowerCase()}`,
    kind,
    enabled: legacyEnabled(kind, d, dressCode),
    props: { kind } as InvitationSection['props'],
  }));
}

function normalizeSections(sections: InvitationSection[]): InvitationSection[] {
  return sections.map((s) => ({
    id: s.id || newId('sec'),
    kind: s.kind,
    enabled: s.enabled !== false,
    title: s.title,
    props: s.props && (s.props as { kind?: SectionKind }).kind === s.kind
      ? s.props
      : ({ ...(s.props as object), kind: s.kind } as InvitationSection['props']),
  }));
}

export function isNormalized(d: InvitationDesign): boolean {
  return (
    !!d.eventType &&
    Array.isArray(d.sections) &&
    !!d.itinerary?.every((it) => !!it.kind) &&
    d.dressCodeMaleHeading === undefined &&
    d.dressCodeFemaleHeading === undefined &&
    d.dressCodeText === undefined
  );
}

/**
 * Upgrades a design to the current shape. Returns the same reference when
 * nothing needs to change, so callers can cheaply skip re-renders.
 */
export function normalizeDesign(input: InvitationDesign): InvitationDesign {
  if (isNormalized(input)) {
    // Still make sure sections carry consistent props (cheap, no allocation if already fine)
    const needsSectionFix = input.sections!.some(
      (s) => !s.id || !s.props || (s.props as { kind?: SectionKind }).kind !== s.kind,
    );
    if (!needsSectionFix) return input;
    return { ...input, sections: normalizeSections(input.sections!) };
  }

  const eventType = normalizeEventType(input.eventType);
  const dressCode = migrateDressCode(input);
  const itinerary = normalizeItinerary(input.itinerary);
  const lang = input.language === 'EN' ? 'EN' : 'ES';

  const rsvpFormConfig = input.rsvpFormConfig
    ? {
        ...input.rsvpFormConfig,
        mealOptions:
          input.rsvpFormConfig.mealOptions ??
          (input.rsvpFormConfig.requireMealPreference ? [...LEGACY_MEAL_OPTIONS[lang]] : []),
      }
    : {
        requireMealPreference: false,
        requireDietaryRestrictions: false,
        allowPlusOnes: false,
        customNotesLabel: null,
        mealOptions: [],
      };

  const sections = Array.isArray(input.sections)
    ? normalizeSections(input.sections)
    : buildLegacySections(input, dressCode);

  // Drop the legacy fields once converted (they only existed for migration)
  const {
    dressCodeText: _dct,
    dressCodeMaleHeading: _mh,
    dressCodeMaleText: _mt,
    dressCodeMaleSubtext: _ms,
    dressCodeMaleAvoidColors: _mc,
    dressCodeFemaleHeading: _fh,
    dressCodeFemaleText: _ft,
    dressCodeFemaleSubtext: _fs,
    dressCodeFemaleAvoidColors: _fc,
    ...rest
  } = input;
  void _dct; void _mh; void _mt; void _ms; void _mc; void _fh; void _ft; void _fs; void _fc;

  return {
    ...rest,
    eventType,
    sections,
    dressCode,
    itinerary,
    rsvpFormConfig,
  };
}
