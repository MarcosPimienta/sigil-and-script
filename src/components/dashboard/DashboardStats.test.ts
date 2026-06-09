import { describe, it, expect } from 'vitest';
import { computeStats } from './DashboardStats';
import type { InviteeRecord } from '../../types/sigil.types';

function makeInvitee(id: string, status: InviteeRecord['status']): InviteeRecord {
  return { id, name: `Guest ${id}`, dependents: [], status };
}

describe('computeStats', () => {
  it('returns all zeros for empty array', () => {
    expect(computeStats([])).toEqual({ total: 0, opened: 0, sent: 0, pending: 0 });
  });

  it('returns correct counts for a mixed-status array', () => {
    const invitees = [
      makeInvitee('1', 'PENDING'),
      makeInvitee('2', 'PENDING'),
      makeInvitee('3', 'SENT'),
      makeInvitee('4', 'SENT'),
      makeInvitee('5', 'OPENED'),
    ];
    expect(computeStats(invitees)).toEqual({ total: 5, opened: 1, sent: 2, pending: 2 });
  });

  it('counts only known status categories', () => {
    const invitees = [
      makeInvitee('1', 'RSVP_YES'),
      makeInvitee('2', 'RSVP_NO'),
    ];
    const stats = computeStats(invitees);
    expect(stats.total).toBe(2);
    expect(stats.opened).toBe(0);
    expect(stats.sent).toBe(0);
    expect(stats.pending).toBe(0);
  });
});
