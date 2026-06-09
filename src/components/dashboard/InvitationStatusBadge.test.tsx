import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvitationStatusBadge } from './InvitationStatusBadge';

describe('InvitationStatusBadge', () => {
  it('renders "Pending" for PENDING status', () => {
    render(<InvitationStatusBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('renders "Opened" for OPENED status', () => {
    render(<InvitationStatusBadge status="OPENED" />);
    expect(screen.getByText('Opened')).toBeTruthy();
  });

  it('renders "Sent" for SENT status', () => {
    render(<InvitationStatusBadge status="SENT" />);
    expect(screen.getByText('Sent')).toBeTruthy();
  });

  it('sets aria-label including the status label', () => {
    render(<InvitationStatusBadge status="OPENED" />);
    expect(screen.getByRole('status', { name: 'Invitation status: Opened' })).toBeTruthy();
  });

  it('applies the correct CSS class for each status', () => {
    const { container } = render(<InvitationStatusBadge status="SENT" />);
    expect(container.querySelector('.status-badge--sent')).toBeTruthy();
  });
});
