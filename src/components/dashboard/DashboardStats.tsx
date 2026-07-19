import { useMemo } from 'react';
import type { InviteeRecord } from '../../types/sigil.types';

interface DashboardStatsProps {
  invitees: InviteeRecord[];
}

// eslint-disable-next-line react-refresh/only-export-components
export function computeStats(invitees: InviteeRecord[]) {
  return {
    total:     invitees.length,
    attending: invitees.filter((i) => i.status === 'RSVP_YES').length,
    declined:  invitees.filter((i) => i.status === 'RSVP_NO').length,
    opened:    invitees.filter((i) => i.status === 'OPENED').length,
    sent:      invitees.filter((i) => i.status === 'SENT').length,
    pending:   invitees.filter((i) => i.status === 'PENDING').length,
  };
}

export function DashboardStats({ invitees }: DashboardStatsProps) {
  const { total, attending, declined, opened, sent, pending } = useMemo(
    () => computeStats(invitees),
    [invitees],
  );

  return (
    <div className="dashboard-stats" role="region" aria-label="Invitation statistics">
      {total} {total === 1 ? 'Guest' : 'Guests'} · {attending} Attending · {declined} Declined · {opened} Opened · {sent} Sent · {pending} Pending
    </div>
  );
}
