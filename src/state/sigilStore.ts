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
import { createDesignFromTemplate } from '../templates';
import type { TemplateLang } from '../templates';
import { normalizeDesign } from '../utils/normalizeDesign';
import { createSection, isSingletonKind, type SectionLang } from '../utils/sectionDefaults';
import type {
  EventType,
  InvitationSection,
  SectionKind,
  TableShape,
  FloorPlanTable,
  FloorPlanSeat,
} from '../types/sigil.types';
import { createEmptySeats } from '../utils/floorPlanUtils';

/** The wedding template is the historical default; see src/templates. */
const DEFAULT_DESIGN: InvitationDesign = createDesignFromTemplate('WEDDING', 'ES');

const DEFAULT_GUEST: GuestPayload = {
  guestName: 'Esteemed Guest',
  additionalGuests: [],
  routingToken: 'preview',
  rsvpBy: '',
  eventDate: '',
  eventLocation: '',
  dependents: [],
};

/** Human date for {{event_date}} derived from the countdown target. */
function formatEventDateForGuest(countdownTarget: string | undefined, lang: string | undefined): string {
  if (!countdownTarget) return '';
  const d = new Date(countdownTarget);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

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
  resetToDefaults: (eventType?: EventType, lang?: TemplateLang) => void;

  // Section builder actions
  addSection: (kind: SectionKind, atIndex?: number) => string | null;
  removeSection: (id: string) => void;
  moveSection: (id: string, direction: 'up' | 'down') => void;
  reorderSections: (ids: string[]) => void;
  toggleSection: (id: string, enabled?: boolean) => void;
  updateSection: (id: string, patch: Partial<InvitationSection>) => void;

  // Floor Plan actions
  addFloorPlanTable: (table: { name?: string; shape: TableShape; seatsCount: number; x?: number; y?: number }) => string;
  updateFloorPlanTable: (tableId: string, patch: Partial<Pick<FloorPlanTable, 'name' | 'shape' | 'seatsCount' | 'rotation'>>) => void;
  removeFloorPlanTable: (tableId: string) => void;
  moveFloorPlanTable: (tableId: string, x: number, y: number) => void;
  assignFloorPlanSeat: (tableId: string, seatNumber: number, guest: { id: string; name: string; isDependent?: boolean; primaryInviteeId?: string }) => void;
  unassignFloorPlanSeat: (tableId: string, seatNumber: number) => void;
  clearAllFloorPlanAssignments: () => void;

  // Roster Actions
  addInvitee: (name: string, email?: string, guestType?: 'INDIVIDUAL' | 'FAMILY', initialDependents?: string[]) => void;
  removeInvitee: (inviteeId: string) => void;
  updateInvitee: (inviteeId: string, updates: Partial<Pick<InviteeRecord, 'name' | 'email' | 'status' | 'language' | 'guestType'>>) => void;
  addDependent: (inviteeId: string, name: string) => void;
  updateDependentName: (inviteeId: string, dependentId: string, name: string) => void;
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
  fetchInvitationDetails: (token: string) => Promise<void>;
  saveCurrentDesign: () => Promise<void>;
  refreshRoster: () => Promise<void>;
  loadDesign: (designId: string) => Promise<void>;
  fetchSavedDesigns: () => Promise<{ id: string; title: string; countdownTarget: string; eventType: EventType }[]>;
  deleteSavedDesign: (designId: string) => Promise<void>;

  // CSV Batch Ingest Action
  ingestGuestsBatch: (records: { name: string; email?: string }[]) => void;

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
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
    set((state) => ({ design: normalizeDesign({ ...state.design, ...updates }) })),

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

  resetToDefaults: (eventType = 'WEDDING', lang = 'ES') =>
    set({
      design: createDesignFromTemplate(eventType, lang),
      guest: DEFAULT_GUEST,
      guestRoster: { invitees: [] },
    }),

  // ── Section builder ────────────────────────────────────────────────────────

  addSection: (kind, atIndex) => {
    const state = get();
    const sections = state.design.sections ?? [];
    // Music is the one kind that must never appear twice.
    if (isSingletonKind(kind) && sections.some((s) => s.kind === kind)) return null;

    const lang: SectionLang = state.design.language === 'EN' ? 'EN' : 'ES';
    const section = createSection(kind, lang);
    const next = [...sections];
    const index = atIndex === undefined ? next.length : Math.max(0, Math.min(atIndex, next.length));
    next.splice(index, 0, section);

    set({
      design: { ...state.design, sections: next },
      inspectorFocus: { type: 'SECTION', sectionId: section.id },
    });
    return section.id;
  },

  removeSection: (id) =>
    set((state) => {
      const sections = (state.design.sections ?? []).filter((s) => s.id !== id);
      const focus = state.inspectorFocus;
      return {
        design: { ...state.design, sections },
        inspectorFocus:
          focus.type === 'SECTION' && focus.sectionId === id ? { type: 'NONE' } : focus,
      };
    }),

  moveSection: (id, direction) =>
    set((state) => {
      const sections = [...(state.design.sections ?? [])];
      const index = sections.findIndex((s) => s.id === id);
      if (index === -1) return {};
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= sections.length) return {};
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { design: { ...state.design, sections } };
    }),

  reorderSections: (ids) =>
    set((state) => {
      const sections = state.design.sections ?? [];
      const byId = new Map(sections.map((s) => [s.id, s]));
      const next: InvitationSection[] = [];
      for (const id of ids) {
        const found = byId.get(id);
        if (found) {
          next.push(found);
          byId.delete(id);
        }
      }
      // Anything not mentioned keeps its relative order at the end.
      for (const s of sections) if (byId.has(s.id)) next.push(s);
      return { design: { ...state.design, sections: next } };
    }),

  toggleSection: (id, enabled) =>
    set((state) => ({
      design: {
        ...state.design,
        sections: (state.design.sections ?? []).map((s) =>
          s.id === id ? { ...s, enabled: enabled === undefined ? !s.enabled : enabled } : s,
        ),
      },
    })),

  updateSection: (id, patch) =>
    set((state) => ({
      design: {
        ...state.design,
        sections: (state.design.sections ?? []).map((s) =>
          s.id === id ? { ...s, ...patch, id: s.id, kind: s.kind } : s,
        ),
      },
    })),

  // ── Floor Plan Actions ──────────────────────────────────────────────────────

  addFloorPlanTable: ({ name, shape, seatsCount, x, y }) => {
    const tableId = crypto.randomUUID();
    const count = Math.max(2, Math.min(24, seatsCount));
    const currentTables = get().design.floorPlan?.tables ?? [];
    const defaultName = name?.trim() || `Table ${currentTables.length + 1}`;

    const defaultX = x !== undefined ? Math.round(x / 20) * 20 : 80 + (currentTables.length % 3) * 280;
    const defaultY = y !== undefined ? Math.round(y / 20) * 20 : 80 + Math.floor(currentTables.length / 3) * 280;

    const newTable: FloorPlanTable = {
      id: tableId,
      name: defaultName,
      shape,
      seatsCount: count,
      x: defaultX,
      y: defaultY,
      rotation: 0,
      seats: createEmptySeats(tableId, count),
    };

    set((state) => ({
      design: {
        ...state.design,
        floorPlan: {
          tables: [...(state.design.floorPlan?.tables ?? []), newTable],
          canvasWidth: state.design.floorPlan?.canvasWidth ?? 1400,
          canvasHeight: state.design.floorPlan?.canvasHeight ?? 900,
        },
      },
    }));

    return tableId;
  },

  updateFloorPlanTable: (tableId, patch) => {
    set((state) => {
      const currentTables = state.design.floorPlan?.tables ?? [];
      const updatedTables = currentTables.map((tbl) => {
        if (tbl.id !== tableId) return tbl;

        const updated: FloorPlanTable = { ...tbl, ...patch };

        if (patch.seatsCount !== undefined && patch.seatsCount !== tbl.seatsCount) {
          const newCount = Math.max(2, Math.min(24, patch.seatsCount));
          updated.seatsCount = newCount;
          if (newCount > tbl.seats.length) {
            const addedSeats: FloorPlanSeat[] = [];
            for (let i = tbl.seats.length + 1; i <= newCount; i++) {
              addedSeats.push({ id: `${tbl.id}-seat-${i}`, seatNumber: i });
            }
            updated.seats = [...tbl.seats, ...addedSeats];
          } else {
            updated.seats = tbl.seats.slice(0, newCount);
          }
        }

        return updated;
      });

      return {
        design: {
          ...state.design,
          floorPlan: {
            tables: updatedTables,
            canvasWidth: state.design.floorPlan?.canvasWidth ?? 1400,
            canvasHeight: state.design.floorPlan?.canvasHeight ?? 900,
          },
        },
      };
    });
  },

  removeFloorPlanTable: (tableId) => {
    set((state) => ({
      design: {
        ...state.design,
        floorPlan: {
          tables: (state.design.floorPlan?.tables ?? []).filter((t) => t.id !== tableId),
          canvasWidth: state.design.floorPlan?.canvasWidth ?? 1400,
          canvasHeight: state.design.floorPlan?.canvasHeight ?? 900,
        },
      },
    }));
  },

  moveFloorPlanTable: (tableId, x, y) => {
    const snappedX = Math.max(0, Math.round(x / 20) * 20);
    const snappedY = Math.max(0, Math.round(y / 20) * 20);

    set((state) => ({
      design: {
        ...state.design,
        floorPlan: {
          tables: (state.design.floorPlan?.tables ?? []).map((t) =>
            t.id === tableId ? { ...t, x: snappedX, y: snappedY } : t,
          ),
          canvasWidth: state.design.floorPlan?.canvasWidth ?? 1400,
          canvasHeight: state.design.floorPlan?.canvasHeight ?? 900,
        },
      },
    }));
  },

  assignFloorPlanSeat: (tableId, seatNumber, guest) => {
    set((state) => {
      const currentTables = state.design.floorPlan?.tables ?? [];

      // 1. Clear guest from any other seat across all tables (Single-seat invariant)
      const clearedTables = currentTables.map((tbl) => ({
        ...tbl,
        seats: tbl.seats.map((s) => {
          if (s.assignedGuestId === guest.id) {
            return {
              id: s.id,
              seatNumber: s.seatNumber,
            };
          }
          return s;
        }),
      }));

      // 2. Assign to the specified table and seat
      const updatedTables = clearedTables.map((tbl) => {
        if (tbl.id !== tableId) return tbl;
        return {
          ...tbl,
          seats: tbl.seats.map((s) => {
            if (s.seatNumber === seatNumber) {
              return {
                ...s,
                assignedGuestId: guest.id,
                assignedGuestName: guest.name,
                isDependent: guest.isDependent,
                primaryInviteeId: guest.primaryInviteeId,
              };
            }
            return s;
          }),
        };
      });

      return {
        design: {
          ...state.design,
          floorPlan: {
            tables: updatedTables,
            canvasWidth: state.design.floorPlan?.canvasWidth ?? 1400,
            canvasHeight: state.design.floorPlan?.canvasHeight ?? 900,
          },
        },
      };
    });
  },

  unassignFloorPlanSeat: (tableId, seatNumber) => {
    set((state) => ({
      design: {
        ...state.design,
        floorPlan: {
          tables: (state.design.floorPlan?.tables ?? []).map((tbl) => {
            if (tbl.id !== tableId) return tbl;
            return {
              ...tbl,
              seats: tbl.seats.map((s) => {
                if (s.seatNumber === seatNumber) {
                  return {
                    id: s.id,
                    seatNumber: s.seatNumber,
                  };
                }
                return s;
              }),
            };
          }),
          canvasWidth: state.design.floorPlan?.canvasWidth ?? 1400,
          canvasHeight: state.design.floorPlan?.canvasHeight ?? 900,
        },
      },
    }));
  },

  clearAllFloorPlanAssignments: () => {
    set((state) => ({
      design: {
        ...state.design,
        floorPlan: {
          tables: (state.design.floorPlan?.tables ?? []).map((tbl) => ({
            ...tbl,
            seats: tbl.seats.map((s) => ({
              id: s.id,
              seatNumber: s.seatNumber,
            })),
          })),
          canvasWidth: state.design.floorPlan?.canvasWidth ?? 1400,
          canvasHeight: state.design.floorPlan?.canvasHeight ?? 900,
        },
      },
    }));
  },

  addInvitee: (name, email, guestType = 'INDIVIDUAL', initialDependents = []) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const deps: Dependent[] = initialDependents
      .map((dName) => dName.trim())
      .filter((dName) => dName.length > 0)
      .map((dName) => ({
        id: crypto.randomUUID(),
        name: dName,
        included: true,
      }));

    const newInvitee: InviteeRecord = {
      id: crypto.randomUUID(),
      name: trimmed,
      email: email?.trim(),
      guestType,
      dependents: deps,
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

  updateDependentName: (inviteeId, dependentId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => {
      const roster = {
        invitees: state.guestRoster.invitees.map((inv) =>
          inv.id === inviteeId
            ? {
                ...inv,
                dependents: inv.dependents.map((d) =>
                  d.id === dependentId ? { ...d, name: trimmed } : d,
                ),
              }
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

  submitRsvp: async (payload) => {
    const { tokenOrId, status, mealPref, dietary, plusOne, notes, dependents } = payload;

    set((state) => {
      const roster = {
        invitees: state.guestRoster.invitees.map((i) =>
          i.id === tokenOrId
            ? {
                ...i,
                status,
                dependents: dependents ?? i.dependents,
              }
            : i
        ),
      };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));

      const isCurrentGuest = state.guest.routingToken === tokenOrId;
      const updatedGuest = isCurrentGuest
        ? {
            ...state.guest,
            dependents: dependents ?? state.guest.dependents,
          }
        : state.guest;

      return {
        guestRoster: roster,
        guest: updatedGuest,
      };
    });

    if (tokenOrId && tokenOrId !== 'preview') {
      try {
        await apiFetch(`/invite/${tokenOrId}/rsvp`, {
          method: 'POST',
          body: JSON.stringify({
            status,
            mealPref: mealPref || null,
            dietary: dietary || null,
            plusOne: plusOne || null,
            notes: notes || null,
            dependents: dependents || [],
          }),
        });
      } catch (err) {
        console.error('Failed to sync RSVP response to backend:', err);
      }
    }
  },

  fetchInvitationDetails: async (token) => {
    set({ apiStatus: 'loading', apiError: null });
    try {
      const data = await apiFetch(`/invite/${token}`);
      
      let additionalGuests: string[] = [];
      let dependentsList: any[] = [];
      try {
        const parsed = JSON.parse(data.formResponses || '{}');
        if (parsed.dependents && Array.isArray(parsed.dependents)) {
          dependentsList = parsed.dependents;
          additionalGuests = parsed.dependents
            .filter((d: any) => d.included)
            .map((d: any) => d.name);
        }
      } catch (e) {
        console.error("Failed to parse dependents from formResponses", e);
      }

      const effectiveLang = (data.language && (data.language === 'EN' || data.language === 'ES'))
        ? (data.language as 'ES' | 'EN')
        : undefined;

      const guest: GuestPayload = {
        guestName: data.name,
        language: effectiveLang,
        guestType: (data.guestType as 'INDIVIDUAL' | 'FAMILY') || 'INDIVIDUAL',
        additionalGuests,
        routingToken: data.id,
        rsvpBy: '',
        eventDate: '',
        eventLocation: '',
        dependents: dependentsList,
      };

      let design: InvitationDesign = {
        ...DEFAULT_DESIGN,
        id: data.canvas.id,
        backgroundColor: data.canvas.envelopeColor,
        musicUrl: data.canvas.musicUrl || '',
      };

      if (data.canvas && data.canvas.designData) {
        try {
          const parsedDesign = JSON.parse(data.canvas.designData);
          design = {
            ...design,
            ...parsedDesign,
            language: effectiveLang || parsedDesign.language || 'ES',
            id: data.canvas.id,
            eventType: parsedDesign.eventType || data.canvas.eventType,
            musicUrl: data.canvas.musicUrl || parsedDesign.musicUrl || '',
          };
        } catch (e) {
          console.error("Failed to parse designData", e);
        }
      }

      design = normalizeDesign(design);
      guest.rsvpBy = design.rsvpDeadline || '';
      guest.eventDate = formatEventDateForGuest(design.countdownTarget, guest.language || design.language);
      guest.eventLocation = design.itinerary?.[0]?.locationName || '';

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
    if (get().user) {
      get().saveCurrentDesign().catch((e) => console.error('Auto-save batch roster error:', e));
    }
  },

  saveCurrentDesign: async () => {
    const { design } = get();
    try {
      const isDefaultId = design.id === 'design-default';
      const { musicUrl, ...designWithoutMusic } = design;
      
      const isBase64Audio = design.musicUrl && design.musicUrl.startsWith('data:audio/');
      const finalMusicUrl = isBase64Audio ? null : (design.musicUrl || null);

      // Clean up base64 image fallbacks only if they exceed 2MB payload size to prevent 413 error
      const cleanedDesign = { ...designWithoutMusic };
      const imageFields: (keyof typeof cleanedDesign)[] = ['openedEnvelopeImage', 'stickerImage', 'closedEnvelopeImage', 'paperImage', 'headerImage', 'frameImage', 'registryImage'];
      imageFields.forEach((f) => {
        const val = cleanedDesign[f];
        if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 2_000_000) {
          (cleanedDesign as any)[f] = undefined;
        }
      });

      const body = {
        id: isDefaultId ? undefined : design.id,
        eventType: design.eventType || 'WEDDING',
        envelopeColor: design.backgroundColor,
        waxSealAsset: design.stickerImage || 'classic-red',
        musicUrl: finalMusicUrl,
        countdownTarget: design.countdownTarget || new Date().toISOString(),
        colorPalette: JSON.stringify([design.backgroundColor]),
        itinerary: JSON.stringify(design.itinerary || []),
        hostId: 'host-default',
        designData: cleanedDesign,
        invitees: get().guestRoster.invitees,
      };

      console.log("Saving design body size report:");
      console.log("- Total body size:", JSON.stringify(body).length, "characters");
      console.log("- musicUrl size:", body.musicUrl ? body.musicUrl.length : 0, "chars");
      console.log("- designData size:", JSON.stringify(body.designData).length, "chars");
      console.log("- invitees list size:", JSON.stringify(body.invitees).length, "chars");

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

  refreshRoster: async () => {
    const { design } = get();
    if (!design.id || design.id === 'design-default') return;
    try {
      const canvas = await apiFetch(`/canvas/${design.id}`);
      if (canvas && Array.isArray(canvas.invitees)) {
        const loadedInvitees: InviteeRecord[] = canvas.invitees.map((inv: any) => {
          let dependents: Dependent[] = [];
          if (inv.formResponses) {
            try {
              const parsed = JSON.parse(inv.formResponses);
              if (Array.isArray(parsed.dependents)) {
                dependents = parsed.dependents.map((d: any) => ({
                  id: d.id || `dep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  name: typeof d === 'string' ? d : (d.name || ''),
                  included: Boolean(d.included === true || d.included === 'true'),
                }));
              }
            } catch (e) {
              console.error('Failed to parse formResponses in refreshRoster', e);
            }
          }
          return {
            id: inv.id,
            name: inv.name,
            language: (inv.language as 'ES' | 'EN') || 'ES',
            guestType: (inv.guestType as 'INDIVIDUAL' | 'FAMILY') || 'INDIVIDUAL',
            email: inv.email || undefined,
            dependents,
            status: (inv.status || 'PENDING') as import('../types/sigil.types').InvitationStatus,
            openedAt: inv.openedTimestamp || undefined,
          };
        });
        const roster: GuestRoster = { invitees: loadedInvitees };
        localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));
        set({ guestRoster: roster });
      }
    } catch (e) {
      console.warn('Failed to refresh live roster from backend:', e);
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
        musicUrl: canvas.musicUrl || loadedDesign.musicUrl || '',
        eventType: loadedDesign.eventType || canvas.eventType,
      };
      const normalizedDesign = normalizeDesign(mergedDesign);

      let loadedInvitees: InviteeRecord[] = [];
      if (Array.isArray(canvas.invitees)) {
        loadedInvitees = canvas.invitees.map((inv: any) => {
          let dependents: Dependent[] = [];
          if (inv.formResponses) {
            try {
              const parsed = JSON.parse(inv.formResponses);
              if (Array.isArray(parsed.dependents)) {
                dependents = parsed.dependents.map((d: any) => ({
                  id: d.id || `dep-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  name: typeof d === 'string' ? d : (d.name || ''),
                  included: Boolean(d.included === true || d.included === 'true'),
                }));
              }
            } catch (e) {
              console.error('Failed to parse guest formResponses in loadDesign', e);
            }
          }
          return {
            id: inv.id,
            name: inv.name,
            language: (inv.language as 'ES' | 'EN') || 'ES',
            guestType: (inv.guestType as 'INDIVIDUAL' | 'FAMILY') || 'INDIVIDUAL',
            email: inv.email || undefined,
            dependents,
            status: (inv.status || 'PENDING') as import('../types/sigil.types').InvitationStatus,
            openedAt: inv.openedTimestamp || undefined,
          };
        });
      }

      const roster: GuestRoster = { invitees: loadedInvitees };
      localStorage.setItem('sigil-guest-roster', JSON.stringify(roster));

      set({
        apiStatus: 'success',
        design: normalizedDesign,
        guestRoster: roster,
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
        let eventType: EventType = 'WEDDING';
        try {
          const parsed = canvas.designData ? JSON.parse(canvas.designData) : {};
          eventType = (parsed.eventType || canvas.eventType || 'WEDDING') as EventType;
        } catch {
          // ignore
        }
        return {
          id: canvas.id,
          title,
          countdownTarget: canvas.countdownTarget,
          eventType,
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

  requestPasswordReset: async (email) => {
    set({ authStatus: 'loading', authError: null });
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      set({ authStatus: 'success' });
      return true;
    } catch (e) {
      set({ authStatus: 'error', authError: e instanceof Error ? e.message : 'Could not send the reset email' });
      return false;
    }
  },

  resetPassword: async (token, password) => {
    set({ authStatus: 'loading', authError: null });
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      // Any local session is revoked server-side by the reset
      localStorage.removeItem('sigil_auth_token');
      localStorage.removeItem('sigil_auth_user');
      set({ token: null, user: null, authStatus: 'success' });
      return true;
    } catch (e) {
      set({ authStatus: 'error', authError: e instanceof Error ? e.message : 'Could not reset the password' });
      return false;
    }
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
