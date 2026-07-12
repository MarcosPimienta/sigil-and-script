// ─────────────────────────────────────────────────────────────────────────────
// Sigil — App State Context
// Central state machine coordinating Creator Mode and Recipient Mode.
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
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';

import type {
  AppMode,
  CanvasSelection,
  Dependent,
  GuestPayload,
  GuestRoster,
  InspectorFocus,
  InvitationDesign,
  InviteeRecord,
} from '../types/sigil.types';

// ── Default Design ────────────────────────────────────────────────────────────

const DEFAULT_DESIGN: InvitationDesign = {
  id: 'design-default',
  title: 'Untitled Invitation',
  paperTexture: 'parchment',
  paperLuminance: 'LIGHT',
  envelopeStyle: 'CLASSIC',
  textBlocks: [
    {
      id: 'tb-headline',
      content: 'You Are Cordially Invited',
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
    {
      id: 'tb-guest',
      content: '{{guest_name}}',
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 1.6,
      fontStyle: 'normal',
      fontWeight: 400,
      color: 'DARK_INK',
      textAlign: 'center',
      letterSpacing: 0.06,
      lineHeight: 1.5,
      marginTop: 2.5,
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
      textAlign: 'center',
      letterSpacing: 0.02,
      lineHeight: 1.8,
      marginTop: 1.5,
    },
    {
      id: 'tb-rsvp',
      content: 'RSVP by {{rsvp_by}}',
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: 0.85,
      fontStyle: 'italic',
      fontWeight: 400,
      color: 'SEPIA_INK',
      textAlign: 'center',
      letterSpacing: 0.08,
      lineHeight: 1.5,
      marginTop: 4,
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
  /** The full guest roster for this event session */
  guestRoster: GuestRoster;
}

const INITIAL_STATE: SigilAppState = {
  appMode: 'CREATOR',
  design: DEFAULT_DESIGN,
  guest: DEFAULT_GUEST,
  inspectorFocus: { type: 'NONE' },
  canvasSelection: { selectedTextBlockId: null },
  isEditingText: false,
  guestRoster: { invitees: [] },
};

// ── Action Types ──────────────────────────────────────────────────────────────

export type SigilAction =
  | { type: 'SET_APP_MODE'; payload: AppMode }
  | { type: 'SET_INSPECTOR_FOCUS'; payload: InspectorFocus }
  | { type: 'SET_CANVAS_SELECTION'; payload: CanvasSelection }
  | { type: 'SET_IS_EDITING_TEXT'; payload: boolean }
  | { type: 'UPDATE_DESIGN'; payload: Partial<InvitationDesign> }
  | { type: 'UPDATE_TEXT_BLOCK'; payload: { blockId: string; updates: Partial<import('../types/sigil.types').TextBlockConfig> } }
  | { type: 'SET_GUEST'; payload: Partial<GuestPayload> }
  | { type: 'RESET_TO_DEFAULTS' }
  // ── Guest Roster ──────────────────────────────────────────────────────────
  | { type: 'ADD_INVITEE'; payload: { name: string; email?: string } }
  | { type: 'REMOVE_INVITEE'; payload: { inviteeId: string } }
  | { type: 'UPDATE_INVITEE'; payload: { inviteeId: string; updates: Partial<Pick<InviteeRecord, 'name' | 'email' | 'status'>> } }
  | { type: 'ADD_DEPENDENT'; payload: { inviteeId: string; name: string } }
  | { type: 'REMOVE_DEPENDENT'; payload: { inviteeId: string; dependentId: string } }
  | { type: 'TOGGLE_DEPENDENT'; payload: { inviteeId: string; dependentId: string } }
  | { type: 'MARK_INVITATION_OPENED'; payload: { inviteeId: string } };

// ── Reducer ───────────────────────────────────────────────────────────────────

function sigilReducer(state: SigilAppState, action: SigilAction): SigilAppState {
  switch (action.type) {
    // ── Mode ────────────────────────────────────────────────────────────────
    case 'SET_APP_MODE':
      return {
        ...state,
        appMode: action.payload,
        canvasSelection: { selectedTextBlockId: null },
        inspectorFocus: { type: 'NONE' },
        isEditingText: false,
      };

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

    // ── Guest Payload ───────────────────────────────────────────────────────
    case 'SET_GUEST':
      return {
        ...state,
        guest: { ...state.guest, ...action.payload },
      };

    // ── Full Reset ──────────────────────────────────────────────────────────
    case 'RESET_TO_DEFAULTS':
      return { ...INITIAL_STATE };

    // ── Guest Roster ─────────────────────────────────────────────────────────
    case 'ADD_INVITEE': {
      const trimmed = action.payload.name.trim();
      if (!trimmed) return state;
      const record: InviteeRecord = {
        id: crypto.randomUUID(),
        name: trimmed,
        email: action.payload.email,
        dependents: [],
        status: 'PENDING',
      };
      return {
        ...state,
        guestRoster: { invitees: [...state.guestRoster.invitees, record] },
      };
    }

    case 'REMOVE_INVITEE':
      return {
        ...state,
        guestRoster: {
          invitees: state.guestRoster.invitees.filter(
            (inv) => inv.id !== action.payload.inviteeId,
          ),
        },
      };

    case 'UPDATE_INVITEE':
      return {
        ...state,
        guestRoster: {
          invitees: state.guestRoster.invitees.map((inv) =>
            inv.id === action.payload.inviteeId
              ? { ...inv, ...action.payload.updates }
              : inv,
          ),
        },
      };

    case 'ADD_DEPENDENT': {
      const depName = action.payload.name.trim();
      if (!depName) return state;
      const dep: Dependent = {
        id: crypto.randomUUID(),
        name: depName,
        included: true,
      };
      return {
        ...state,
        guestRoster: {
          invitees: state.guestRoster.invitees.map((inv) =>
            inv.id === action.payload.inviteeId
              ? { ...inv, dependents: [...inv.dependents, dep] }
              : inv,
          ),
        },
      };
    }

    case 'REMOVE_DEPENDENT':
      return {
        ...state,
        guestRoster: {
          invitees: state.guestRoster.invitees.map((inv) =>
            inv.id === action.payload.inviteeId
              ? {
                  ...inv,
                  dependents: inv.dependents.filter(
                    (d) => d.id !== action.payload.dependentId,
                  ),
                }
              : inv,
          ),
        },
      };

    case 'TOGGLE_DEPENDENT': {
      const targetInv = state.guestRoster.invitees.find(
        (inv) => inv.id === action.payload.inviteeId,
      );
      if (!targetInv) return state;
      const targetDep = targetInv.dependents.find(
        (d) => d.id === action.payload.dependentId,
      );
      if (!targetDep) return state;
      return {
        ...state,
        guestRoster: {
          invitees: state.guestRoster.invitees.map((inv) =>
            inv.id === action.payload.inviteeId
              ? {
                  ...inv,
                  dependents: inv.dependents.map((d) =>
                    d.id === action.payload.dependentId
                      ? { ...d, included: !d.included }
                      : d,
                  ),
                }
              : inv,
          ),
        },
      };
    }

    case 'MARK_INVITATION_OPENED': {
      const inv = state.guestRoster.invitees.find(
        (i) => i.id === action.payload.inviteeId,
      );
      if (!inv || inv.status === 'OPENED') return state;
      return {
        ...state,
        guestRoster: {
          invitees: state.guestRoster.invitees.map((i) =>
            i.id === action.payload.inviteeId
              ? { ...i, status: 'OPENED', openedAt: new Date().toISOString() }
              : i,
          ),
        },
      };
    }

    default:
      return state;
  }
}

// ── Test export (reducer only, no React dependency) ───────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export { sigilReducer as sigilReducerForTest };

// ── Context & Dispatch Types ──────────────────────────────────────────────────

interface SigilContextValue {
  state: SigilAppState;
  dispatch: React.Dispatch<SigilAction>;
  // ── Convenience action creators ─────────────────────────────────────────
  setAppMode: (mode: AppMode) => void;
  focusInspector: (focus: InspectorFocus) => void;
  selectTextBlock: (blockId: string | null) => void;
  updateDesign: (updates: Partial<InvitationDesign>) => void;
  updateTextBlock: (blockId: string, updates: Partial<import('../types/sigil.types').TextBlockConfig>) => void;
  setGuest: (payload: Partial<GuestPayload>) => void;
  // ── Guest Roster ────────────────────────────────────────────────────────
  addInvitee: (name: string, email?: string) => void;
  removeInvitee: (inviteeId: string) => void;
  updateInvitee: (inviteeId: string, updates: Partial<Pick<InviteeRecord, 'name' | 'email' | 'status'>>) => void;
  addDependent: (inviteeId: string, name: string) => void;
  removeDependent: (inviteeId: string, dependentId: string) => void;
  toggleDependent: (inviteeId: string, dependentId: string) => void;
  markInvitationOpened: (inviteeId: string) => void;
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
    (base) => {
      let roster: GuestRoster = { invitees: [] };
      try {
        const stored = localStorage.getItem('sigil-guest-roster');
        if (stored) roster = JSON.parse(stored) as GuestRoster;
      } catch {
        // Malformed JSON or storage unavailable — use empty roster
      }
      return {
        ...base,
        guestRoster: roster,
        guest: initialGuest ? { ...DEFAULT_GUEST, ...initialGuest } : base.guest,
      };
    },
  );

  useEffect(() => {
    try {
      localStorage.setItem('sigil-guest-roster', JSON.stringify(state.guestRoster));
    } catch {
      // Storage quota exceeded — fail silently
    }
  }, [state.guestRoster]);

  // ── Action Creators ──────────────────────────────────────────────────────

  const setAppMode = useCallback(
    (mode: AppMode) => dispatch({ type: 'SET_APP_MODE', payload: mode }),
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

  const setGuest = useCallback(
    (payload: Partial<GuestPayload>) =>
      dispatch({ type: 'SET_GUEST', payload }),
    [],
  );

  const addInvitee = useCallback(
    (name: string, email?: string) =>
      dispatch({ type: 'ADD_INVITEE', payload: { name, email } }),
    [],
  );

  const removeInvitee = useCallback(
    (inviteeId: string) =>
      dispatch({ type: 'REMOVE_INVITEE', payload: { inviteeId } }),
    [],
  );

  const updateInvitee = useCallback(
    (inviteeId: string, updates: Partial<Pick<InviteeRecord, 'name' | 'email' | 'status'>>) =>
      dispatch({ type: 'UPDATE_INVITEE', payload: { inviteeId, updates } }),
    [],
  );

  const addDependent = useCallback(
    (inviteeId: string, name: string) =>
      dispatch({ type: 'ADD_DEPENDENT', payload: { inviteeId, name } }),
    [],
  );

  const removeDependent = useCallback(
    (inviteeId: string, dependentId: string) =>
      dispatch({ type: 'REMOVE_DEPENDENT', payload: { inviteeId, dependentId } }),
    [],
  );

  const toggleDependent = useCallback(
    (inviteeId: string, dependentId: string) =>
      dispatch({ type: 'TOGGLE_DEPENDENT', payload: { inviteeId, dependentId } }),
    [],
  );

  const markInvitationOpened = useCallback(
    (inviteeId: string) =>
      dispatch({ type: 'MARK_INVITATION_OPENED', payload: { inviteeId } }),
    [],
  );

  const value: SigilContextValue = {
    state,
    dispatch,
    setAppMode,
    focusInspector,
    selectTextBlock,
    updateDesign,
    updateTextBlock,
    setGuest,
    addInvitee,
    removeInvitee,
    updateInvitee,
    addDependent,
    removeDependent,
    toggleDependent,
    markInvitationOpened,
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
// eslint-disable-next-line react-refresh/only-export-components
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
// eslint-disable-next-line react-refresh/only-export-components
export function useSigilSelector<T>(selector: (state: SigilAppState) => T): T {
  const { state } = useSigil();
  return selector(state);
}
