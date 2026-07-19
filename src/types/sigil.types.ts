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
  /** Optional array for multi-guest invitations */
  additionalGuests?: string[];
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

// ── Invitation Design ─────────────────────────────────────────────────────────

export interface InvitationDesign {
  id: string;
  title: string;
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
  /** Full-bleed decorative frame, stretched to the stage bounds; replaces the procedural border when set */
  frameImage?: string;
  /** Tiled/cover background texture for the paper itself */
  paperImage?: string;
  rsvpFormConfig?: RsvpFormConfig;
  countdownTarget?: string;
  itinerary?: ItineraryItem[];
  colorPalette?: string[];
  dressCodeText?: string;
  dressCodeMaleHeading?: string;
  dressCodeMaleText?: string;
  dressCodeMaleSubtext?: string;
  dressCodeMaleAvoidColors?: string[];
  dressCodeFemaleHeading?: string;
  dressCodeFemaleText?: string;
  dressCodeFemaleSubtext?: string;
  dressCodeFemaleAvoidColors?: string[];
  registryLink?: string;
  registryText?: string;
  closedEnvelopeImage?: string;
  openedEnvelopeImage?: string;
  stickerImage?: string;
  sealSize?: number;
  musicUrl?: string;
  language?: 'EN' | 'ES';
}

// ── Itinerary Schema ──────────────────────────────────────────────────────────

export interface ItineraryItem {
  id: string;
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
}


// ── Inspector Focus ───────────────────────────────────────────────────────────

/** Which element the user has clicked — drives the Contextual Inspector panel */
export type InspectorFocus =
  | { type: 'NONE' }
  | { type: 'PAPER'; design: InvitationDesign }
  | { type: 'TEXT_BLOCK'; blockId: string };

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

