import type { InvitationStatus } from '../../types/sigil.types';

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
}

const STATUS_LABELS: Record<InvitationStatus, string> = {
  PENDING:  'Pending',
  SENT:     'Sent',
  OPENED:   'Opened',
  RSVP_YES: 'Attending',
  RSVP_NO:  'Declined',
};

export function InvitationStatusBadge({ status }: InvitationStatusBadgeProps) {
  const label = STATUS_LABELS[status];
  return (
    <span
      role="status"
      className={`status-badge status-badge--${status.toLowerCase()}`}
      aria-label={`Invitation status: ${label}`}
    >
      {label}
    </span>
  );
}
