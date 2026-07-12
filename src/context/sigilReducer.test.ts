import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GuestRoster, InviteeRecord } from '../types/sigil.types';
import { sigilReducerForTest as reducer } from './SigilContext';
import type { SigilAppState } from './SigilContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const emptyRoster: GuestRoster = { invitees: [] };

function makeState(partial?: Partial<SigilAppState>): SigilAppState {
  return {
    appMode: 'CREATOR',
    design: {} as SigilAppState['design'],
    guest: {
      guestName: '',
      routingToken: 'preview',
    },
    inspectorFocus: { type: 'NONE' },
    canvasSelection: { selectedTextBlockId: null },
    isEditingText: false,
    guestRoster: emptyRoster,
    ...partial,
  };
}

function makeInvitee(overrides?: Partial<InviteeRecord>): InviteeRecord {
  return {
    id: 'inv-1',
    name: 'Sophie Martin',
    dependents: [],
    status: 'PENDING',
    ...overrides,
  };
}

// Stub crypto.randomUUID for deterministic test IDs
beforeEach(() => {
  let counter = 0;
  vi.stubGlobal('crypto', {
    randomUUID: () => `test-uuid-${++counter}`,
  });
});

// ---------------------------------------------------------------------------
// ADD_INVITEE
// ---------------------------------------------------------------------------

describe('ADD_INVITEE', () => {
  it('appends a new invitee with trimmed name and PENDING status', () => {
    const state = makeState();
    const next = reducer(state, { type: 'ADD_INVITEE', payload: { name: '  Sophie Martin  ' } });
    expect(next.guestRoster.invitees).toHaveLength(1);
    expect(next.guestRoster.invitees[0].name).toBe('Sophie Martin');
    expect(next.guestRoster.invitees[0].status).toBe('PENDING');
    expect(next.guestRoster.invitees[0].dependents).toEqual([]);
  });

  it('generates a non-empty string id', () => {
    const state = makeState();
    const next = reducer(state, { type: 'ADD_INVITEE', payload: { name: 'Sophie' } });
    expect(typeof next.guestRoster.invitees[0].id).toBe('string');
    expect(next.guestRoster.invitees[0].id.length).toBeGreaterThan(0);
  });

  it('stores optional email when provided', () => {
    const state = makeState();
    const next = reducer(state, { type: 'ADD_INVITEE', payload: { name: 'Sophie', email: 'sophie@example.com' } });
    expect(next.guestRoster.invitees[0].email).toBe('sophie@example.com');
  });

  it('does not add when name is empty after trim', () => {
    const state = makeState();
    const next = reducer(state, { type: 'ADD_INVITEE', payload: { name: '   ' } });
    expect(next.guestRoster.invitees).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// REMOVE_INVITEE
// ---------------------------------------------------------------------------

describe('REMOVE_INVITEE', () => {
  it('removes the matching invitee by id', () => {
    const state = makeState({ guestRoster: { invitees: [makeInvitee()] } });
    const next = reducer(state, { type: 'REMOVE_INVITEE', payload: { inviteeId: 'inv-1' } });
    expect(next.guestRoster.invitees).toHaveLength(0);
  });

  it('leaves other invitees unchanged', () => {
    const state = makeState({
      guestRoster: {
        invitees: [makeInvitee({ id: 'inv-1' }), makeInvitee({ id: 'inv-2', name: 'Luca' })],
      },
    });
    const next = reducer(state, { type: 'REMOVE_INVITEE', payload: { inviteeId: 'inv-1' } });
    expect(next.guestRoster.invitees).toHaveLength(1);
    expect(next.guestRoster.invitees[0].id).toBe('inv-2');
  });

  it('is a no-op when id does not exist', () => {
    const state = makeState({ guestRoster: { invitees: [makeInvitee()] } });
    const next = reducer(state, { type: 'REMOVE_INVITEE', payload: { inviteeId: 'no-such-id' } });
    expect(next.guestRoster.invitees).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// UPDATE_INVITEE
// ---------------------------------------------------------------------------

describe('UPDATE_INVITEE', () => {
  it('merges partial updates into the matching record', () => {
    const state = makeState({ guestRoster: { invitees: [makeInvitee()] } });
    const next = reducer(state, {
      type: 'UPDATE_INVITEE',
      payload: { inviteeId: 'inv-1', updates: { name: 'Sophie Dupont', email: 'sd@example.com' } },
    });
    expect(next.guestRoster.invitees[0].name).toBe('Sophie Dupont');
    expect(next.guestRoster.invitees[0].email).toBe('sd@example.com');
  });

  it('does not mutate other records', () => {
    const state = makeState({
      guestRoster: {
        invitees: [makeInvitee({ id: 'inv-1' }), makeInvitee({ id: 'inv-2', name: 'Luca' })],
      },
    });
    const next = reducer(state, {
      type: 'UPDATE_INVITEE',
      payload: { inviteeId: 'inv-1', updates: { name: 'Changed' } },
    });
    expect(next.guestRoster.invitees[1].name).toBe('Luca');
  });
});

// ---------------------------------------------------------------------------
// ADD_DEPENDENT
// ---------------------------------------------------------------------------

describe('ADD_DEPENDENT', () => {
  it('appends a dependent with trimmed name, included true, and generated id', () => {
    const state = makeState({ guestRoster: { invitees: [makeInvitee()] } });
    const next = reducer(state, {
      type: 'ADD_DEPENDENT',
      payload: { inviteeId: 'inv-1', name: '  Luca Martin  ' },
    });
    const dep = next.guestRoster.invitees[0].dependents[0];
    expect(dep.name).toBe('Luca Martin');
    expect(dep.included).toBe(true);
    expect(typeof dep.id).toBe('string');
    expect(dep.id.length).toBeGreaterThan(0);
  });

  it('does not add when name is empty after trim', () => {
    const state = makeState({ guestRoster: { invitees: [makeInvitee()] } });
    const next = reducer(state, {
      type: 'ADD_DEPENDENT',
      payload: { inviteeId: 'inv-1', name: '   ' },
    });
    expect(next.guestRoster.invitees[0].dependents).toHaveLength(0);
  });

  it('is a no-op when inviteeId does not exist', () => {
    const state = makeState({ guestRoster: { invitees: [makeInvitee()] } });
    const next = reducer(state, {
      type: 'ADD_DEPENDENT',
      payload: { inviteeId: 'no-such', name: 'Ghost' },
    });
    expect(next.guestRoster.invitees[0].dependents).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// REMOVE_DEPENDENT
// ---------------------------------------------------------------------------

describe('REMOVE_DEPENDENT', () => {
  it('removes the dependent by (inviteeId, dependentId)', () => {
    const state = makeState({
      guestRoster: {
        invitees: [makeInvitee({ dependents: [{ id: 'dep-1', name: 'Luca', included: true }] })],
      },
    });
    const next = reducer(state, {
      type: 'REMOVE_DEPENDENT',
      payload: { inviteeId: 'inv-1', dependentId: 'dep-1' },
    });
    expect(next.guestRoster.invitees[0].dependents).toHaveLength(0);
  });

  it('leaves other dependents unchanged', () => {
    const state = makeState({
      guestRoster: {
        invitees: [
          makeInvitee({
            dependents: [
              { id: 'dep-1', name: 'Luca', included: true },
              { id: 'dep-2', name: 'Ella', included: true },
            ],
          }),
        ],
      },
    });
    const next = reducer(state, {
      type: 'REMOVE_DEPENDENT',
      payload: { inviteeId: 'inv-1', dependentId: 'dep-1' },
    });
    expect(next.guestRoster.invitees[0].dependents).toHaveLength(1);
    expect(next.guestRoster.invitees[0].dependents[0].id).toBe('dep-2');
  });
});

// ---------------------------------------------------------------------------
// TOGGLE_DEPENDENT
// ---------------------------------------------------------------------------

describe('TOGGLE_DEPENDENT', () => {
  it('flips included from true to false', () => {
    const state = makeState({
      guestRoster: {
        invitees: [makeInvitee({ dependents: [{ id: 'dep-1', name: 'Luca', included: true }] })],
      },
    });
    const next = reducer(state, {
      type: 'TOGGLE_DEPENDENT',
      payload: { inviteeId: 'inv-1', dependentId: 'dep-1' },
    });
    expect(next.guestRoster.invitees[0].dependents[0].included).toBe(false);
  });

  it('flips included from false to true', () => {
    const state = makeState({
      guestRoster: {
        invitees: [makeInvitee({ dependents: [{ id: 'dep-1', name: 'Luca', included: false }] })],
      },
    });
    const next = reducer(state, {
      type: 'TOGGLE_DEPENDENT',
      payload: { inviteeId: 'inv-1', dependentId: 'dep-1' },
    });
    expect(next.guestRoster.invitees[0].dependents[0].included).toBe(true);
  });

  it('is a no-op when dependent does not exist', () => {
    const state = makeState({ guestRoster: { invitees: [makeInvitee()] } });
    const next = reducer(state, {
      type: 'TOGGLE_DEPENDENT',
      payload: { inviteeId: 'inv-1', dependentId: 'no-dep' },
    });
    expect(next).toEqual(state);
  });
});

// ---------------------------------------------------------------------------
// MARK_INVITATION_OPENED
// ---------------------------------------------------------------------------

describe('MARK_INVITATION_OPENED', () => {
  it('sets status to OPENED and sets openedAt', () => {
    const state = makeState({ guestRoster: { invitees: [makeInvitee()] } });
    const next = reducer(state, {
      type: 'MARK_INVITATION_OPENED',
      payload: { inviteeId: 'inv-1' },
    });
    expect(next.guestRoster.invitees[0].status).toBe('OPENED');
    expect(typeof next.guestRoster.invitees[0].openedAt).toBe('string');
    expect(next.guestRoster.invitees[0].openedAt!.length).toBeGreaterThan(0);
  });

  it('does not overwrite openedAt when status is already OPENED', () => {
    const existing = '2026-01-01T00:00:00.000Z';
    const state = makeState({
      guestRoster: {
        invitees: [makeInvitee({ status: 'OPENED', openedAt: existing })],
      },
    });
    const next = reducer(state, {
      type: 'MARK_INVITATION_OPENED',
      payload: { inviteeId: 'inv-1' },
    });
    expect(next.guestRoster.invitees[0].openedAt).toBe(existing);
  });

  it('is a no-op when inviteeId does not exist', () => {
    const state = makeState({ guestRoster: { invitees: [makeInvitee()] } });
    const next = reducer(state, {
      type: 'MARK_INVITATION_OPENED',
      payload: { inviteeId: 'no-such' },
    });
    expect(next.guestRoster.invitees[0].status).toBe('PENDING');
  });
});
