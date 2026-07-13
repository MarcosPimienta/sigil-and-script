import { create } from 'zustand';
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
import { apiFetch } from '../utils/api';

const DEFAULT_DESIGN: InvitationDesign = {
  id: 'design-default',
  title: 'Untitled Invitation',
  paperTexture: 'parchment',
  paperLuminance: 'LIGHT',
  envelopeStyle: 'CLASSIC',
  textBlocks: [
    {
      id: 'tb-headline',
      content: 'Oscar & Rocio',
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
  rsvpFormConfig: {
    requireMealPreference: false,
    requireDietaryRestrictions: false,
    allowPlusOnes: false,
    customNotesLabel: null,
  },
  countdownTarget: '2026-09-17T18:00:00',
  itinerary: [
    {
      id: 'itin-1',
      title: 'Ceremonia Religiosa',
      locationName: 'Parroquia Nuestra Señora de Aránzazu, Constitución 950, San Fernando',
      time: '18:00',
      mapLink: 'https://maps.google.com',
    },
    {
      id: 'itin-2',
      title: 'Recepción',
      locationName: 'Palacio Sans Souci, Paz 705',
      time: '19:00',
      mapLink: 'https://maps.google.com',
    },
  ],
  colorPalette: ['#4f5d47', '#a08e7c', '#4c4844', '#dfb88e', '#e8e5c8'],
  dressCodeText: 'Formal',
  registryText: 'Su compañía es lo más importante. Si desean hacernos un obsequio, lo recibiremos con mucho cariño.',
  registryLink: '',
  closedEnvelopeImage: '',
  openedEnvelopeImage: '',
  stickerImage: '',
  sealSize: 75,
};

const DEFAULT_GUEST: GuestPayload = {
  guestName: 'Esteemed Guest',
  additionalGuests: [],
  routingToken: 'preview',
  rsvpBy: 'January 31st',
  eventDate: 'February 14th, 2027',
  eventLocation: 'The Grand Atelier',
};

export interface SigilState {
  appMode: AppMode;
  design: InvitationDesign;
  guest: GuestPayload;
  inspectorFocus: InspectorFocus;
  canvasSelection: CanvasSelection;
  isEditingText: boolean;
  guestRoster: GuestRoster;
  apiStatus: ApiStatus;
  apiError: string | null;

  // Actions
  setAppMode: (mode: AppMode) => void;
  focusInspector: (focus: InspectorFocus) => void;
  selectTextBlock: (blockId: string | null) => void;
  setIsEditingText: (isEditing: boolean) => void;
  updateDesign: (updates: Partial<InvitationDesign>) => void;
  updateTextBlock: (blockId: string, updates: Partial<import('../types/sigil.types').TextBlockConfig>) => void;
  setGuest: (payload: Partial<GuestPayload>) => void;
  resetToDefaults: () => void;

  // Roster Actions
  addInvitee: (name: string, email?: string) => void;
  removeInvitee: (inviteeId: string) => void;
  updateInvitee: (inviteeId: string, updates: Partial<Pick<InviteeRecord, 'name' | 'email' | 'status'>>) => void;
  addDependent: (inviteeId: string, name: string) => void;
  removeDependent: (inviteeId: string, dependentId: string) => void;
  toggleDependent: (inviteeId: string, dependentId: string) => void;
  markInvitationOpened: (inviteeId: string) => void;
  fetchInvitationDetails: (token: string) => Promise<void>;
  
  // CSV Batch Ingest Action
  ingestGuestsBatch: (records: { name: string; email?: string }[]) => void;
}

function loadRoster(): GuestRoster {
  try {
    const stored = localStorage.getItem('sigil-guest-roster');
    if (stored) return JSON.parse(stored) as GuestRoster;
  } catch {
    // fail silently
  }
  return { invitees: [] };
}

export const useSigilStore = create<SigilState>((set) => ({
  appMode: 'CREATOR',
  design: DEFAULT_DESIGN,
  guest: DEFAULT_GUEST,
  inspectorFocus: { type: 'NONE' },
  canvasSelection: { selectedTextBlockId: null },
  isEditingText: false,
  guestRoster: loadRoster(),
  apiStatus: 'idle',
  apiError: null,

  setAppMode: (mode) =>
    set({
      appMode: mode,
      canvasSelection: { selectedTextBlockId: null },
      inspectorFocus: { type: 'NONE' },
      isEditingText: false,
    }),

  focusInspector: (focus) => set({ inspectorFocus: focus }),

  selectTextBlock: (blockId) =>
    set({ canvasSelection: { selectedTextBlockId: blockId } }),

  setIsEditingText: (isEditing) => set({ isEditingText: isEditing }),

  updateDesign: (updates) =>
    set((state) => ({ design: { ...state.design, ...updates } })),

  updateTextBlock: (blockId, updates) =>
    set((state) => ({
      design: {
        ...state.design,
        textBlocks: state.design.textBlocks.map((block) =>
          block.id === blockId ? { ...block, ...updates } : block,
        ),
      },
    })),

  setGuest: (payload) =>
    set((state) => ({ guest: { ...state.guest, ...payload } })),

  resetToDefaults: () =>
    set({
      design: DEFAULT_DESIGN,
      guest: DEFAULT_GUEST,
      guestRoster: { invitees: [] },
    }),

  addInvitee: (name, email) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newInvitee: InviteeRecord = {
      id: crypto.randomUUID(),
      name: trimmed,
      email: email?.trim(),
      dependents: [],
      status: 'PENDING',
    };
    set((state) => {
      const roster = { invitees: [...state.guestRoster.invitees, newInvitee] };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));
      return { guestRoster: roster };
    });
  },

  removeInvitee: (inviteeId) => {
    set((state) => {
      const roster = {
        invitees: state.guestRoster.invitees.filter((inv) => inv.id !== inviteeId),
      };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));
      return { guestRoster: roster };
    });
  },

  updateInvitee: (inviteeId, updates) => {
    set((state) => {
      const roster = {
        invitees: state.guestRoster.invitees.map((inv) =>
          inv.id === inviteeId ? { ...inv, ...updates } : inv,
        ),
      };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));
      return { guestRoster: roster };
    });
  },

  addDependent: (inviteeId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newDep: Dependent = {
      id: crypto.randomUUID(),
      name: trimmed,
      included: true,
    };
    set((state) => {
      const roster = {
        invitees: state.guestRoster.invitees.map((inv) =>
          inv.id === inviteeId
            ? { ...inv, dependents: [...inv.dependents, newDep] }
            : inv,
        ),
      };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));
      return { guestRoster: roster };
    });
  },

  removeDependent: (inviteeId, dependentId) => {
    set((state) => {
      const roster = {
        invitees: state.guestRoster.invitees.map((inv) =>
          inv.id === inviteeId
            ? { ...inv, dependents: inv.dependents.filter((d) => d.id !== dependentId) }
            : inv,
        ),
      };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));
      return { guestRoster: roster };
    });
  },

  toggleDependent: (inviteeId, dependentId) => {
    set((state) => {
      const roster = {
        invitees: state.guestRoster.invitees.map((inv) =>
          inv.id === inviteeId
            ? {
                ...inv,
                dependents: inv.dependents.map((d) =>
                  d.id === dependentId ? { ...d, included: !d.included } : d,
                ),
              }
            : inv,
        ),
      };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));
      return { guestRoster: roster };
    });
  },

  markInvitationOpened: (inviteeId) => {
    set((state) => {
      const roster = {
        invitees: state.guestRoster.invitees.map((i) =>
          i.id === inviteeId && i.status !== 'OPENED'
            ? { ...i, status: 'OPENED' as const, openedAt: new Date().toISOString() }
            : i,
        ),
      };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));
      return { guestRoster: roster };
    });
  },

  fetchInvitationDetails: async (token) => {
    set({ apiStatus: 'loading', apiError: null });
    try {
      const data = await apiFetch(`/invite/${token}`);
      const guest: GuestPayload = {
        guestName: data.name,
        additionalGuests: [],
        routingToken: data.id,
        rsvpBy: 'January 31st',
        eventDate: 'February 14th, 2027',
        eventLocation: 'The Grand Atelier',
      };
      const design: InvitationDesign = {
        ...DEFAULT_DESIGN,
        id: data.canvas.id,
        backgroundColor: data.canvas.envelopeColor,
      };
      set({ apiStatus: 'success', guest, design });
    } catch (error: any) {
      set({
        apiStatus: 'error',
        apiError: error.message || 'Failed to fetch invitation details',
      });
    }
  },

  ingestGuestsBatch: (records) => {
    set((state) => {
      const newGuests: InviteeRecord[] = [];
      for (const r of records) {
        const name = r.name.trim();
        if (name) {
          newGuests.push({
            id: crypto.randomUUID() as string,
            name,
            email: r.email?.trim(),
            dependents: [],
            status: 'PENDING',
          });
        }
      }

      if (newGuests.length === 0) return {};

      const roster = {
        invitees: [...state.guestRoster.invitees, ...newGuests],
      };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));
      return { guestRoster: roster };
    });
  },
}));
