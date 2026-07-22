import { useMemo } from 'react';
import type { InviteeRecord } from '../../types/sigil.types';

interface DashboardStatsProps {
  invitees: InviteeRecord[];
}

// eslint-disable-next-line react-refresh/only-export-components
export function computeStats(invitees: InviteeRecord[]) {
  const getGuestCount = (i: InviteeRecord) => 1 + (i.dependents?.length || 0);
  const totalDependents = invitees.reduce((acc, i) => acc + (i.dependents?.length || 0), 0);

  return {
    total:      invitees.reduce((acc, i) => acc + getGuestCount(i), 0),
    dependents: totalDependents,
    attending:  invitees.filter((i) => i.status === 'RSVP_YES').reduce((acc, i) => acc + getGuestCount(i), 0),
    declined:   invitees.filter((i) => i.status === 'RSVP_NO').reduce((acc, i) => acc + getGuestCount(i), 0),
    opened:     invitees.filter((i) => i.status === 'OPENED').reduce((acc, i) => acc + getGuestCount(i), 0),
    sent:       invitees.filter((i) => i.status === 'SENT').reduce((acc, i) => acc + getGuestCount(i), 0),
    pending:    invitees.filter((i) => i.status === 'PENDING').reduce((acc, i) => acc + getGuestCount(i), 0),
  };
}

export function DashboardStats({ invitees }: DashboardStatsProps) {
  const { total, dependents, attending, declined, opened, sent, pending } = useMemo(
    () => computeStats(invitees),
    [invitees],
  );

  return (
    <div className="dashboard-stats" role="region" aria-label="Invitation statistics">
      {total} {total === 1 ? 'Guest' : 'Guests'} ({dependents} {dependents === 1 ? 'Dependent' : 'Dependents'}) · {attending} Attending · {declined} Declined · {opened} Opened · {sent} Sent · {pending} Pending
    </div>
  );
}
