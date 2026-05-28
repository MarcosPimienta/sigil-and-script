// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Core Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// ── App Mode ─────────────────────────────────────────────────────────────────

/** Top-level mode: who is currently using the canvas */
export type AppMode = 'CREATOR' | 'RECIPIENT';

// ── Recipient Reveal State Machine ────────────────────────────────────────────

/** The three phases of the invitation reveal sequence */
export type RevealState = 'LOCKED' | 'ANIMATING' | 'REVEALED';

// ── Envelope / Container Styles ───────────────────────────────────────────────

export type EnvelopeStyle = 'CLASSIC' | 'SCROLL' | 'BOOKLET';

// ── Paper Textures ────────────────────────────────────────────────────────────

export type PaperTexture = 'linen' | 'parchment' | 'cotton-rag' | 'vellum';

/** Luminance tier derived from the paper texture — drives ink/wax guardrails */
export type PaperLuminance = 'LIGHT' | 'MEDIUM' | 'DARK';

// ── Wax Seal ──────────────────────────────────────────────────────────────────

export type SealState = 'INTACT' | 'BREAKING' | 'BROKEN';

export interface WaxSealConfig {
  /** CSS custom property color token, e.g. var(--wax-crimson) */
  color: string;
  /** CSS variable for the lighter sheen of the wax */
  colorLight: string;
  /** CSS variable for the deep shadow of the wax */
  colorSheen: string;
  /** SVG path/glyph identifier for the seal motif */
  motif: 'fleur-de-lis' | 'sigil-s' | 'botanical' | 'geometric' | 'monogram';
  /** Custom text for monogram motif (e.g. "M&A") */
  monogramText: string;
  /** Rotation of the entire seal in degrees */
  rotation: number;
  /** Scale factor relative to the default 96px base */
  scale: number;
  /** 3D depth: maps to feDistantLight elevation (0=dramatic, 100=flat) */
  depth: number;
  state: SealState;
}

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
  /** Position as percentage of the invitation stage dimensions */
  x: number;
  y: number;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number; // em units
  lineHeight: number;
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
}

// ── Invitation Design ─────────────────────────────────────────────────────────

export interface InvitationDesign {
  id: string;
  title: string;
  paperTexture: PaperTexture;
  paperLuminance: PaperLuminance;
  envelopeStyle: EnvelopeStyle;
  waxSeal: WaxSealConfig;
  textBlocks: TextBlockConfig[];
  /** Border treatment for the deckled-edge effect */
  borderStyle: 'deckled' | 'torn' | 'clean' | 'scalloped';
  /** CSS color token for the invitation background */
  backgroundColor: string;
}

// ── Inspector Focus ───────────────────────────────────────────────────────────

/** Which element the user has clicked — drives the Contextual Inspector panel */
export type InspectorFocus =
  | { type: 'NONE' }
  | { type: 'PAPER'; design: InvitationDesign }
  | { type: 'TEXT_BLOCK'; blockId: string }
  | { type: 'WAX_SEAL' };

// ── Canvas Selection ──────────────────────────────────────────────────────────

export interface CanvasSelection {
  selectedTextBlockId: string | null;
}
