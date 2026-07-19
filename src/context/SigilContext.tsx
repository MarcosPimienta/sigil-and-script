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
  useEffect,
  type ReactNode,
} from 'react';
import { useSigilStore } from '../state/sigilStore';


import type {
  AppMode,
  CanvasSelection,
  Dependent,
  GuestPayload,
  GuestRoster,
  InspectorFocus,
  InvitationDesign,
  InviteeRecord,
  ApiStatus,
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
  eventLocation: '',
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
  apiStatus: ApiStatus;
  apiError: string | null;
}

const INITIAL_STATE: SigilAppState = {
  appMode: 'CREATOR',
  design: DEFAULT_DESIGN,
  guest: DEFAULT_GUEST,
  inspectorFocus: { type: 'NONE' },
  canvasSelection: { selectedTextBlockId: null },
  isEditingText: false,
  guestRoster: { invitees: [] },
  apiStatus: 'idle',
  apiError: null,
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
  | { type: 'MARK_INVITATION_OPENED'; payload: { inviteeId: string } }
  | { type: 'FETCH_INVITATION_START' }
  | { type: 'FETCH_INVITATION_SUCCESS'; payload: { guest: GuestPayload; design: InvitationDesign } }
  | { type: 'FETCH_INVITATION_FAILURE'; payload: string };

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

    case 'FETCH_INVITATION_START':
      return {
        ...state,
        apiStatus: 'loading',
        apiError: null,
      };

    case 'FETCH_INVITATION_SUCCESS':
      return {
        ...state,
        apiStatus: 'success',
        apiError: null,
        guest: action.payload.guest,
        design: action.payload.design,
      };

    case 'FETCH_INVITATION_FAILURE':
      return {
        ...state,
        apiStatus: 'error',
        apiError: action.payload,
      };

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
  fetchInvitationDetails: (token: string) => Promise<void>;

  // ── Guest Roster ────────────────────────────────────────────────────────
  addInvitee: (name: string, email?: string) => void;
  removeInvitee: (inviteeId: string) => void;
  updateInvitee: (inviteeId: string, updates: Partial<Pick<InviteeRecord, 'name' | 'email' | 'status'>>) => void;
  addDependent: (inviteeId: string, name: string) => void;
  removeDependent: (inviteeId: string, dependentId: string) => void;
  toggleDependent: (inviteeId: string, dependentId: string) => void;
  markInvitationOpened: (inviteeId: string) => void;
  submitRsvp: (payload: {
    tokenOrId: string;
    status: 'RSVP_YES' | 'RSVP_NO';
    mealPref?: string;
    dietary?: string;
    plusOne?: string;
    notes?: string;
    dependents?: Dependent[];
  }) => Promise<void>;
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
  const setGuest = useSigilStore((s) => s.setGuest);
  useEffect(() => {
    if (initialGuest) {
      setGuest(initialGuest);
    }
  }, [initialGuest, setGuest]);

  return <>{children}</>;
}

// ── Consumer Hooks ────────────────────────────────────────────────────────────

/**
 * Primary hook for all Sigil state and actions.
 * Backed by Zustand store.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSigil(): SigilContextValue {
  const store = useSigilStore();
  return {
    state: store,
    dispatch: () => {},
    setAppMode: store.setAppMode,
    focusInspector: store.focusInspector,
    selectTextBlock: store.selectTextBlock,
    updateDesign: store.updateDesign,
    updateTextBlock: store.updateTextBlock,
    setGuest: store.setGuest,
    addInvitee: store.addInvitee,
    removeInvitee: store.removeInvitee,
    updateInvitee: store.updateInvitee,
    addDependent: store.addDependent,
    removeDependent: store.removeDependent,
    toggleDependent: store.toggleDependent,
    markInvitationOpened: store.markInvitationOpened,
    submitRsvp: store.submitRsvp,
    fetchInvitationDetails: store.fetchInvitationDetails,
  };
}

/**
 * Lightweight selector hook — reads a derived slice of state directly from Zustand.
 * Prevents unnecessary re-renders when other state properties change.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSigilSelector<T>(selector: (state: SigilAppState) => T): T {
  return useSigilStore(selector);
}
