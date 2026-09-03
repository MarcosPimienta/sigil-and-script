// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Core Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// ── App Mode ─────────────────────────────────────────────────────────────────

/** Top-level mode: who is currently using the canvas */
export type AppMode = 'CREATOR' | 'RECIPIENT' | 'DASHBOARD' | 'EVENTS_HUB';

// ── Envelope / Container Styles ───────────────────────────────────────────────

export type EnvelopeStyle = 'CLASSIC' | 'SCROLL' | 'BOOKLET';

// ── Paper Textures ────────────────────────────────────────────────────────────

export type PaperTexture = 'linen' | 'parchment' | 'cotton-rag' | 'vellum';

/** Luminance tier derived from the paper texture — drives ink/wax guardrails */
export type PaperLuminance = 'LIGHT' | 'MEDIUM' | 'DARK';

// ── Typography ────────────────────────────────────────────────────────────────

export type InkColor = 'DARK_INK' | 'LIGHT_INK' | 'SEPIA_INK' | 'METALLIC_GOLD' | 'METALLIC_SILVER';

export interface TextBlockConfig {
  id: string;
  content: string;
  fontFamily: string;
  fontSize: number; // rem units
  fontStyle: 'normal' | 'italic';
  fontWeight: 400 | 600 | 700;
  color: InkColor;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number; // em units
  lineHeight: number;
  /** Space above this block, in the flowing stack of text blocks (rem units) */
  marginTop: number;
}

// ── Guest Roster ──────────────────────────────────────────────────────────────

export interface Dependent {
  id: string;
  name: string;
  included: boolean;
}

export type InvitationStatus =
  | 'PENDING'
  | 'SENT'
  | 'OPENED'
  | 'RSVP_YES'
  | 'RSVP_NO';

export interface InviteeRecord {
  id: string;
  name: string;
  email?: string;
  language?: 'ES' | 'EN';
  guestType?: 'INDIVIDUAL' | 'FAMILY';
  dependents: Dependent[];
  status: InvitationStatus;
  openedAt?: string;
}

export interface GuestRoster {
  invitees: InviteeRecord[];
}

// ── Guest System ──────────────────────────────────────────────────────────────

export interface GuestPayload {
  /** Primary name or family name. Supports "The Smith Family" */
  guestName: string;
  name?: string;
  language?: 'ES' | 'EN';
  guestType?: 'INDIVIDUAL' | 'FAMILY';
  /** Optional array for multi-guest invitations */
  additionalGuests?: (string | { name: string; included?: boolean })[];
  /** Unique token used for mock routing */
  routingToken: string;
  /** Optional RSVP deadline date string */
  rsvpBy?: string;
  /** Optional event date string */
  eventDate?: string;
  /** Optional event location */
  eventLocation?: string;
  /** Optional dependents list for RSVP checkboxes */
  dependents?: Dependent[];
}

// ── Event Types & Sections ────────────────────────────────────────────────────

/** Kind of celebration. Selects a template at creation and phrasing afterwards. */
export type EventType = 'WEDDING' | 'BIRTHDAY' | 'BAPTISM' | 'CORPORATE' | 'CUSTOM';

export const EVENT_TYPES: EventType[] = ['WEDDING', 'BIRTHDAY', 'BAPTISM', 'CORPORATE', 'CUSTOM'];

/** Typed itinerary entry — drives the icon; never inferred from the title at render time. */
export type ItineraryKind =
  | 'CEREMONY'
  | 'RECEPTION'
  | 'PARTY'
  | 'DINNER'
  | 'TALK'
  | 'ACTIVITY'
  | 'CUSTOM';

export const ITINERARY_KINDS: ItineraryKind[] = [
  'CEREMONY', 'RECEPTION', 'PARTY', 'DINNER', 'TALK', 'ACTIVITY', 'CUSTOM',
];

/** Icon ids available in src/components/icons/eventIcons.tsx */
export type IconId =
  | 'church' | 'rings' | 'toast' | 'cake' | 'balloon' | 'gift' | 'dinner'
  | 'podium' | 'briefcase' | 'dove' | 'candle' | 'music' | 'pin'
  | 'suit' | 'dress' | 'tie' | 'badge' | 'sparkle' | 'play' | 'eye' | 'eyeOff' | 'trash' | 'plus';

export interface DressCodeGroup {
  id: string;
  /** "Ellos", "Ellas", "Invitados", "Team" */
  label: string;
  /** "Traje formal" */
  text: string;
  subtext?: string;
  avoidColors?: string[];
  icon?: IconId;
}

export interface DressCodeConfig {
  /** Overall dress code, e.g. "Formal" (was dressCodeText) */
  intro?: string;
  groups: DressCodeGroup[];
}

export type SectionKind =
  | 'AUDIO'
  | 'VIDEO'
  | 'COUNTDOWN'
  | 'ITINERARY'
  | 'DRESS_CODE'
  | 'GIFTS'
  | 'RSVP'
  | 'TEXT'
  | 'IMAGE'
  | 'DIVIDER';

/**
 * Kinds limited to one per invitation. Only music: two songs playing at once is
 * never wanted. Everything else may be repeated (duplicate RSVP just warns).
 */
export const SINGLETON_SECTION_KINDS: SectionKind[] = ['AUDIO'];

export const SECTION_KINDS: SectionKind[] = [
  'AUDIO', 'VIDEO', 'COUNTDOWN', 'ITINERARY', 'DRESS_CODE', 'GIFTS', 'RSVP', 'TEXT', 'IMAGE', 'DIVIDER',
];

/** How a video section's `src` should be played. */
export type VideoProvider = 'FILE' | 'YOUTUBE' | 'VIMEO';

export type SectionProps =
  | { kind: 'TEXT'; content: string; fontFamily: string; fontSize: number; fontStyle: 'normal' | 'italic'; color: InkColor; textAlign: 'left' | 'center' | 'right' }
  | { kind: 'IMAGE'; src: string; scale: number; caption?: string }
  | { kind: 'DIVIDER'; ornament: 'flourish' | 'line' | 'dots' }
  | { kind: 'VIDEO'; src: string; provider: VideoProvider; caption?: string; poster?: string; loop?: boolean }
  | { kind: 'AUDIO' | 'COUNTDOWN' | 'ITINERARY' | 'DRESS_CODE' | 'GIFTS' | 'RSVP' };

/** Per-section typography. Unset keys keep the invitation's default fonts. */
export interface SectionFonts {
  /** Display font for the section's headings. */
  heading?: string;
  /** Body font for the section's text. */
  body?: string;
}

export interface InvitationSection {
  id: string;
  kind: SectionKind;
  enabled: boolean;
  /** Optional heading override; renderers fall back to phrasing / i18n. */
  title?: string;
  /** Optional font overrides for this section only. */
  fonts?: SectionFonts;
  props: SectionProps;
}

// ── Invitation Design ─────────────────────────────────────────────────────────

export interface InvitationDesign {
  id: string;
  title: string;
  hostNames?: string;
  language?: 'ES' | 'EN';
  /** Missing on legacy designs → treated as WEDDING by normalizeDesign */
  eventType?: EventType;
  /** Ordered section placements. Missing on legacy designs → built by normalizeDesign */
  sections?: InvitationSection[];
  /** Dress code groups. Missing on legacy designs → migrated from the legacy male/female fields */
  dressCode?: DressCodeConfig;
  /** Free-text RSVP deadline shown to guests (e.g. "31 de enero") */
  rsvpDeadline?: string;
  paperTexture: PaperTexture;
  paperLuminance: PaperLuminance;
  envelopeStyle: EnvelopeStyle;
  textBlocks: TextBlockConfig[];
  /** Border treatment for the deckled-edge effect */
  borderStyle: 'deckled' | 'torn' | 'clean' | 'scalloped';
  /** CSS color token for the invitation background */
  backgroundColor: string;
  /** Custom uploaded artwork (data URLs) — layered over the procedural design */
  /** Shown centered near the top of the stage, above the headline */
  headerImage?: string;
  headerImageScale?: number;
  /** Full-bleed decorative frame, stretched to the stage bounds; replaces the procedural border when set */
  frameImage?: string;
  /** Tiled/cover background texture for the paper itself */
  paperImage?: string;
  /** Filter brightness applied to the custom paper image (default: 1.0) */
  paperBrightness?: number;
  /** Filter contrast applied to the custom paper image (default: 1.0) */
  paperContrast?: number;
  /** Filter saturation applied to the custom paper image (default: 1.0) */
  paperSaturate?: number;
  rsvpFormConfig?: RsvpFormConfig;
  countdownTarget?: string;
  itinerary?: ItineraryItem[];
  colorPalette?: string[];
  /** @deprecated use dressCode.intro — read only by normalizeDesign */
  dressCodeText?: string;
  /** @deprecated use dressCode.groups — read only by normalizeDesign */
  dressCodeMaleHeading?: string;
  /** @deprecated */
  dressCodeMaleText?: string;
  /** @deprecated */
  dressCodeMaleSubtext?: string;
  /** @deprecated */
  dressCodeMaleAvoidColors?: string[];
  /** @deprecated */
  dressCodeFemaleHeading?: string;
  /** @deprecated */
  dressCodeFemaleText?: string;
  /** @deprecated */
  dressCodeFemaleSubtext?: string;
  /** @deprecated */
  dressCodeFemaleAvoidColors?: string[];
  registryLink?: string;
  registryTitle?: string;
  registryText?: string;
  registrySymbol?: string;
  registryImage?: string;
  registryImageScale?: number;
  closedEnvelopeImage?: string;
  openedEnvelopeImage?: string;
  openedEnvelopeImageScale?: number;
  stickerImage?: string;
  sealSize?: number;
  musicUrl?: string;
}

// ── Itinerary Schema ──────────────────────────────────────────────────────────

export interface ItineraryItem {
  id: string;
  /** Missing on legacy items → inferred once by normalizeDesign */
  kind?: ItineraryKind;
  title: string;
  locationName: string;
  time: string;
  mapLink?: string;
}


// ── RSVP Form Configuration ──────────────────────────────────────────────────

export interface RsvpFormConfig {
  requireMealPreference: boolean;
  requireDietaryRestrictions: boolean;
  allowPlusOnes: boolean;
  customNotesLabel: string | null;
  /** Host-defined menu shown when requireMealPreference is on */
  mealOptions?: string[];
}


// ── Inspector Focus ───────────────────────────────────────────────────────────

/** Which element the user has clicked — drives the Contextual Inspector panel */
export type InspectorFocus =
  | { type: 'NONE' }
  | { type: 'PAPER'; design: InvitationDesign }
  | { type: 'TEXT_BLOCK'; blockId: string }
  | { type: 'SECTION'; sectionId: string };

// ── Canvas Selection ──────────────────────────────────────────────────────────

export interface CanvasSelection {
  selectedTextBlockId: string | null;
}

// ── API State Indicators ──────────────────────────────────────────────────────

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState {
  status: ApiStatus;
  error: string | null;
}

