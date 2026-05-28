// ─────────────────────────────────────────────────────────────────────────────
// Sigil — App State Context
// Central state machine coordinating Creator Mode, Recipient Mode, and the
// invitation Reveal State lifecycle.
//
// Security notes:
//   - No sensitive user data is stored in this context. Guest names are
//     treated as display strings and are never inserted via innerHTML
//     (all rendering uses React's JSX auto-escaping or textContent).
//   - TODO(security): If a backend is added, guest routing tokens MUST be
//     validated server-side; never trust client-provided tokens alone.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';

import type {
  AppMode,
  CanvasSelection,
  GuestPayload,
  InspectorFocus,
  InvitationDesign,
  RevealState,
} from '../types/sigil.types';

// ── Default Design ────────────────────────────────────────────────────────────

const DEFAULT_DESIGN: InvitationDesign = {
  id: 'design-default',
  title: 'Untitled Invitation',
  paperTexture: 'parchment',
  paperLuminance: 'LIGHT',
  envelopeStyle: 'CLASSIC',
  waxSeal: {
    color: 'var(--wax-crimson)',
    colorLight: 'var(--wax-crimson-light)',
    colorSheen: 'var(--wax-crimson-sheen)',
    motif: 'monogram',
    monogramText: 'M&A',
    rotation: -12,
    scale: 1,
    depth: 40,
    state: 'INTACT',
  },
  textBlocks: [
    {
      id: 'tb-headline',
      content: 'You Are Cordially Invited',
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 2.2,
      fontStyle: 'italic',
      fontWeight: 400,
      color: 'DARK_INK',
      x: 50,
      y: 22,
      textAlign: 'center',
      letterSpacing: 0.04,
      lineHeight: 1.25,
    },
    {
      id: 'tb-guest',
      content: '{{guest_name}}',
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 1.6,
      fontStyle: 'normal',
      fontWeight: 400,
      color: 'DARK_INK',
      x: 50,
      y: 38,
      textAlign: 'center',
      letterSpacing: 0.06,
      lineHeight: 1.5,
    },
    {
      id: 'tb-body',
      content:
        'to join us for an evening of celebration\non {{event_date}} at {{event_location}}',
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 1.05,
      fontStyle: 'normal',
      fontWeight: 400,
      color: 'DARK_INK',
      x: 50,
      y: 52,
      textAlign: 'center',
      letterSpacing: 0.02,
      lineHeight: 1.8,
    },
    {
      id: 'tb-rsvp',
      content: 'RSVP by {{rsvp_by}}',
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 0.85,
      fontStyle: 'italic',
      fontWeight: 400,
      color: 'SEPIA_INK',
      x: 50,
      y: 78,
      textAlign: 'center',
      letterSpacing: 0.08,
      lineHeight: 1.5,
    },
  ],
  borderStyle: 'deckled',
  backgroundColor: 'var(--paper-parchment)',
};

// ── Default Guest Payload ─────────────────────────────────────────────────────

const DEFAULT_GUEST: GuestPayload = {
  guestName: 'Esteemed Guest',
  additionalGuests: [],
  routingToken: 'preview',
  rsvpBy: 'January 31st',
  eventDate: 'February 14th, 2027',
  eventLocation: 'The Grand Atelier',
};

// ── State Shape ───────────────────────────────────────────────────────────────

export interface SigilAppState {
  /** Whether the canvas is in designer or recipient view */
  appMode: AppMode;
  /** Current reveal phase for the recipient experience */
  revealState: RevealState;
  /** The full invitation design being authored or viewed */
  design: InvitationDesign;
  /** Guest data hydrating the template tokens */
  guest: GuestPayload;
  /** Which element the Inspector sidebar is focused on */
  inspectorFocus: InspectorFocus;
  /** Currently selected canvas element(s) */
  canvasSelection: CanvasSelection;
  /** Whether the text editor is in active editing mode */
  isEditingText: boolean;
}

const INITIAL_STATE: SigilAppState = {
  appMode: 'CREATOR',
  revealState: 'LOCKED',
  design: DEFAULT_DESIGN,
  guest: DEFAULT_GUEST,
  inspectorFocus: { type: 'NONE' },
  canvasSelection: { selectedTextBlockId: null },
  isEditingText: false,
};

// ── Action Types ──────────────────────────────────────────────────────────────

export type SigilAction =
  | { type: 'SET_APP_MODE'; payload: AppMode }
  | { type: 'SET_REVEAL_STATE'; payload: RevealState }
  | { type: 'START_REVEAL_ANIMATION' }
  | { type: 'COMPLETE_REVEAL' }
  | { type: 'RESET_REVEAL' }
  | { type: 'SET_INSPECTOR_FOCUS'; payload: InspectorFocus }
  | { type: 'SET_CANVAS_SELECTION'; payload: CanvasSelection }
  | { type: 'SET_IS_EDITING_TEXT'; payload: boolean }
  | { type: 'UPDATE_DESIGN'; payload: Partial<InvitationDesign> }
  | { type: 'UPDATE_TEXT_BLOCK'; payload: { blockId: string; updates: Partial<import('../types/sigil.types').TextBlockConfig> } }
  | { type: 'UPDATE_WAX_SEAL'; payload: Partial<import('../types/sigil.types').WaxSealConfig> }
  | { type: 'SET_GUEST'; payload: Partial<GuestPayload> }
  | { type: 'RESET_TO_DEFAULTS' };

// ── Reducer ───────────────────────────────────────────────────────────────────

function sigilReducer(state: SigilAppState, action: SigilAction): SigilAppState {
  switch (action.type) {
    // ── Mode ────────────────────────────────────────────────────────────────
    case 'SET_APP_MODE':
      return {
        ...state,
        appMode: action.payload,
        // Reset reveal when switching back to creator
        revealState: action.payload === 'CREATOR' ? 'LOCKED' : state.revealState,
        canvasSelection: { selectedTextBlockId: null },
        inspectorFocus: { type: 'NONE' },
        isEditingText: false,
      };

    // ── Reveal State Machine ────────────────────────────────────────────────
    case 'SET_REVEAL_STATE':
      return { ...state, revealState: action.payload };

    case 'START_REVEAL_ANIMATION':
      // Guard: only transition from LOCKED
      if (state.revealState !== 'LOCKED') return state;
      return { ...state, revealState: 'ANIMATING' };

    case 'COMPLETE_REVEAL':
      // Guard: only transition from ANIMATING
      if (state.revealState !== 'ANIMATING') return state;
      return { ...state, revealState: 'REVEALED' };

    case 'RESET_REVEAL':
      return { ...state, revealState: 'LOCKED' };

    // ── Inspector ───────────────────────────────────────────────────────────
    case 'SET_INSPECTOR_FOCUS':
      return { ...state, inspectorFocus: action.payload };

    // ── Canvas Selection ────────────────────────────────────────────────────
    case 'SET_CANVAS_SELECTION':
      return { ...state, canvasSelection: action.payload };

    case 'SET_IS_EDITING_TEXT':
      return { ...state, isEditingText: action.payload };

    // ── Design Mutations ────────────────────────────────────────────────────
    case 'UPDATE_DESIGN':
      return {
        ...state,
        design: { ...state.design, ...action.payload },
      };

    case 'UPDATE_TEXT_BLOCK': {
      const { blockId, updates } = action.payload;
      return {
        ...state,
        design: {
          ...state.design,
          textBlocks: state.design.textBlocks.map((block) =>
            block.id === blockId ? { ...block, ...updates } : block,
          ),
        },
      };
    }

    case 'UPDATE_WAX_SEAL':
      return {
        ...state,
        design: {
          ...state.design,
          waxSeal: { ...state.design.waxSeal, ...action.payload },
        },
      };

    // ── Guest Payload ───────────────────────────────────────────────────────
    case 'SET_GUEST':
      return {
        ...state,
        guest: { ...state.guest, ...action.payload },
      };

    // ── Full Reset ──────────────────────────────────────────────────────────
    case 'RESET_TO_DEFAULTS':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ── Context & Dispatch Types ──────────────────────────────────────────────────

interface SigilContextValue {
  state: SigilAppState;
  dispatch: React.Dispatch<SigilAction>;
  // ── Convenience action creators ─────────────────────────────────────────
  setAppMode: (mode: AppMode) => void;
  startReveal: () => void;
  completeReveal: () => void;
  resetReveal: () => void;
  focusInspector: (focus: InspectorFocus) => void;
  selectTextBlock: (blockId: string | null) => void;
  updateDesign: (updates: Partial<InvitationDesign>) => void;
  updateTextBlock: (blockId: string, updates: Partial<import('../types/sigil.types').TextBlockConfig>) => void;
  updateWaxSeal: (updates: Partial<import('../types/sigil.types').WaxSealConfig>) => void;
  setGuest: (payload: Partial<GuestPayload>) => void;
}

// ── Context Creation ──────────────────────────────────────────────────────────

const SigilContext = createContext<SigilContextValue | null>(null);
SigilContext.displayName = 'SigilContext';

// ── Provider ──────────────────────────────────────────────────────────────────

interface SigilProviderProps {
  children: ReactNode;
  /** Optional initial guest payload for recipient mode hydration */
  initialGuest?: Partial<GuestPayload>;
}

export function SigilProvider({ children, initialGuest }: SigilProviderProps) {
  const [state, dispatch] = useReducer(
    sigilReducer,
    INITIAL_STATE,
    (base) => ({
      ...base,
      guest: initialGuest ? { ...DEFAULT_GUEST, ...initialGuest } : base.guest,
    }),
  );

  // ── Action Creators ──────────────────────────────────────────────────────

  const setAppMode = useCallback(
    (mode: AppMode) => dispatch({ type: 'SET_APP_MODE', payload: mode }),
    [],
  );

  const startReveal = useCallback(
    () => dispatch({ type: 'START_REVEAL_ANIMATION' }),
    [],
  );

  const completeReveal = useCallback(
    () => dispatch({ type: 'COMPLETE_REVEAL' }),
    [],
  );

  const resetReveal = useCallback(
    () => dispatch({ type: 'RESET_REVEAL' }),
    [],
  );

  const focusInspector = useCallback(
    (focus: InspectorFocus) =>
      dispatch({ type: 'SET_INSPECTOR_FOCUS', payload: focus }),
    [],
  );

  const selectTextBlock = useCallback(
    (blockId: string | null) =>
      dispatch({
        type: 'SET_CANVAS_SELECTION',
        payload: { selectedTextBlockId: blockId },
      }),
    [],
  );

  const updateDesign = useCallback(
    (updates: Partial<InvitationDesign>) =>
      dispatch({ type: 'UPDATE_DESIGN', payload: updates }),
    [],
  );

  const updateTextBlock = useCallback(
    (blockId: string, updates: Partial<import('../types/sigil.types').TextBlockConfig>) =>
      dispatch({ type: 'UPDATE_TEXT_BLOCK', payload: { blockId, updates } }),
    [],
  );

  const updateWaxSeal = useCallback(
    (updates: Partial<import('../types/sigil.types').WaxSealConfig>) =>
      dispatch({ type: 'UPDATE_WAX_SEAL', payload: updates }),
    [],
  );

  const setGuest = useCallback(
    (payload: Partial<GuestPayload>) =>
      dispatch({ type: 'SET_GUEST', payload }),
    [],
  );

  const value: SigilContextValue = {
    state,
    dispatch,
    setAppMode,
    startReveal,
    completeReveal,
    resetReveal,
    focusInspector,
    selectTextBlock,
    updateDesign,
    updateTextBlock,
    updateWaxSeal,
    setGuest,
  };

  return (
    <SigilContext.Provider value={value}>
      {children}
    </SigilContext.Provider>
  );
}

// ── Consumer Hook ─────────────────────────────────────────────────────────────

/**
 * Primary hook for all Sigil state and actions.
 * Must be used inside a <SigilProvider>.
 */
export function useSigil(): SigilContextValue {
  const ctx = useContext(SigilContext);
  if (ctx === null) {
    throw new Error('useSigil must be used within a <SigilProvider>.');
  }
  return ctx;
}

/**
 * Lightweight selector hook — avoids re-renders when only reading
 * a derived slice of state.
 */
export function useSigilSelector<T>(selector: (state: SigilAppState) => T): T {
  const { state } = useSigil();
  return selector(state);
}
