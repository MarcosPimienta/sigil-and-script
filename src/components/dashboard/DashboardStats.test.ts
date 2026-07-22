import { describe, it, expect } from 'vitest';
import { computeStats } from './DashboardStats';
import type { InviteeRecord } from '../../types/sigil.types';

function makeInvitee(id: string, status: InviteeRecord['status']): InviteeRecord {
  return { id, name: `Guest ${id}`, dependents: [], status };
}

describe('computeStats', () => {
  it('returns all zeros for empty array', () => {
    expect(computeStats([])).toEqual({ total: 0, dependents: 0, attending: 0, declined: 0, opened: 0, sent: 0, pending: 0 });
  });

  it('returns correct counts for a mixed-status array', () => {
    const invitees = [
      makeInvitee('1', 'PENDING'),
      makeInvitee('2', 'PENDING'),
      makeInvitee('3', 'SENT'),
      makeInvitee('4', 'SENT'),
      makeInvitee('5', 'OPENED'),
    ];
    expect(computeStats(invitees)).toEqual({ total: 5, dependents: 0, attending: 0, declined: 0, opened: 1, sent: 2, pending: 2 });
  });

  it('counts attending and declined status categories correctly', () => {
    const invitees = [
      makeInvitee('1', 'RSVP_YES'),
      makeInvitee('2', 'RSVP_NO'),
    ];
    const stats = computeStats(invitees);
    expect(stats.total).toBe(2);
    expect(stats.dependents).toBe(0);
    expect(stats.attending).toBe(1);
    expect(stats.declined).toBe(1);
    expect(stats.opened).toBe(0);
    expect(stats.sent).toBe(0);
    expect(stats.pending).toBe(0);
  });

  it('includes dependents in total and category guest calculations', () => {
    const invitees: InviteeRecord[] = [
      { id: '1', name: 'Family 1', dependents: [{ id: 'd1', name: 'Child 1', included: true }, { id: 'd2', name: 'Child 2', included: true }], status: 'RSVP_YES' },
      { id: '2', name: 'Family 2', dependents: [{ id: 'd3', name: 'Spouse', included: true }], status: 'RSVP_NO' },
    ];
    const stats = computeStats(invitees);
    expect(stats.total).toBe(5); // 3 for family 1 + 2 for family 2
    expect(stats.dependents).toBe(3); // 2 + 1
    expect(stats.attending).toBe(3);
    expect(stats.declined).toBe(2);
  });
});
