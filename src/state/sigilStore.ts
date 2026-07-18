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
  musicUrl: '',
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

  // Auth state
  user: { id: string; email: string; name: string | null } | null;
  token: string | null;
  authStatus: 'idle' | 'loading' | 'success' | 'error';
  authError: string | null;

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
  saveCurrentDesign: () => Promise<void>;
  loadDesign: (designId: string) => Promise<void>;
  fetchSavedDesigns: () => Promise<{ id: string; title: string; countdownTarget: string }[]>;
  deleteSavedDesign: (designId: string) => Promise<void>;

  // CSV Batch Ingest Action
  ingestGuestsBatch: (records: { name: string; email?: string }[]) => void;

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
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

const initialToken = localStorage.getItem('sigil_auth_token');
const initialUser = (() => {
  try {
    const u = localStorage.getItem('sigil_auth_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
})();

export const useSigilStore = create<SigilState>((set, get) => ({
  appMode: initialToken ? 'EVENTS_HUB' : 'CREATOR',
  design: DEFAULT_DESIGN,
  guest: DEFAULT_GUEST,
  inspectorFocus: { type: 'NONE' },
  canvasSelection: { selectedTextBlockId: null },
  isEditingText: false,
  guestRoster: loadRoster(),
  apiStatus: 'idle',
  apiError: null,
  user: initialUser,
  token: initialToken,
  authStatus: 'idle',
  authError: null,

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

  saveCurrentDesign: async () => {
    const { design } = get();
    set({ apiStatus: 'loading', apiError: null });
    try {
      const isDefaultId = design.id === 'design-default';
      const body = {
        id: isDefaultId ? undefined : design.id,
        envelopeColor: design.backgroundColor,
        waxSealAsset: design.stickerImage || 'classic-red',
        musicUrl: design.musicUrl || null,
        countdownTarget: design.countdownTarget || new Date().toISOString(),
        colorPalette: JSON.stringify([design.backgroundColor]),
        itinerary: JSON.stringify(design.itinerary || []),
        hostId: 'host-default',
        designData: JSON.stringify(design),
      };

      const data = await apiFetch('/canvas', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      set((state) => ({
        apiStatus: 'success',
        design: {
          ...state.design,
          id: data.id,
        },
      }));
    } catch (error: any) {
      set({
        apiStatus: 'error',
        apiError: error.message || 'Failed to save configuration',
      });
      throw error;
    }
  },

  loadDesign: async (designId) => {
    set({ apiStatus: 'loading', apiError: null });
    try {
      const canvas = await apiFetch(`/canvas/${designId}`);
      if (!canvas) {
        throw new Error('Configuration not found');
      }

      let loadedDesign: Partial<InvitationDesign> = {};
      try {
        if (canvas.designData) {
          loadedDesign = JSON.parse(canvas.designData);
        }
      } catch (e) {
        console.error('Failed to parse designData, falling back to columns', e);
      }

      const mergedDesign: InvitationDesign = {
        ...DEFAULT_DESIGN,
        ...loadedDesign,
        id: canvas.id,
        backgroundColor: canvas.envelopeColor || loadedDesign.backgroundColor || DEFAULT_DESIGN.backgroundColor,
        stickerImage: canvas.waxSealAsset !== 'classic-red' ? canvas.waxSealAsset : (loadedDesign.stickerImage || DEFAULT_DESIGN.stickerImage),
        countdownTarget: canvas.countdownTarget || loadedDesign.countdownTarget || DEFAULT_DESIGN.countdownTarget,
        itinerary: canvas.itinerary ? JSON.parse(canvas.itinerary) : (loadedDesign.itinerary || DEFAULT_DESIGN.itinerary),
      };

      set({
        apiStatus: 'success',
        design: mergedDesign,
      });
    } catch (error: any) {
      set({
        apiStatus: 'error',
        apiError: error.message || 'Failed to load configuration',
      });
      throw error;
    }
  },

  fetchSavedDesigns: async () => {
    try {
      const data = await apiFetch('/canvas');
      return data.map((canvas: any) => {
        let title = 'Untitled Invitation';
        try {
          if (canvas.designData) {
            const parsed = JSON.parse(canvas.designData);
            if (parsed.title) title = parsed.title;
          }
        } catch {
          // ignore
        }
        return {
          id: canvas.id,
          title,
          countdownTarget: canvas.countdownTarget,
        };
      });
    } catch (error: any) {
      console.error('Failed to fetch saved configurations:', error);
      throw error;
    }
  },

  deleteSavedDesign: async (designId) => {
    try {
      await apiFetch(`/canvas/${designId}`, {
        method: 'DELETE',
      });
      const { design } = get();
      if (design.id === designId) {
        set({
          design: {
            ...DEFAULT_DESIGN,
            id: 'design-default',
          },
        });
      }
    } catch (error: any) {
      console.error('Failed to delete configuration:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    set({ authStatus: 'loading', authError: null });
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('sigil_auth_token', data.token);
      localStorage.setItem('sigil_auth_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user, authStatus: 'success', appMode: 'EVENTS_HUB' });
      return true;
    } catch (e: any) {
      set({ authStatus: 'error', authError: e.message || 'Login failed' });
      return false;
    }
  },

  register: async (email, password, name) => {
    set({ authStatus: 'loading', authError: null });
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      return await get().login(email, password);
    } catch (e: any) {
      set({ authStatus: 'error', authError: e.message || 'Registration failed' });
      return false;
    }
  },

  logout: async () => {
    const token = get().token;
    if (token) {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch {
        // fail silently
      }
    }
    localStorage.removeItem('sigil_auth_token');
    localStorage.removeItem('sigil_auth_user');
    set({ token: null, user: null, authStatus: 'idle', authError: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem('sigil_auth_token');
    const u = localStorage.getItem('sigil_auth_user');
    if (token && u) {
      try {
        set({ token, user: JSON.parse(u) });
      } catch {
        localStorage.removeItem('sigil_auth_token');
        localStorage.removeItem('sigil_auth_user');
        set({ token: null, user: null });
      }
    }
  },
}));
