import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuestHierarchyTreeView, formatGuestHierarchyText } from './GuestHierarchyTreeView';
import type { InviteeRecord } from '../../types/sigil.types';

const sampleInvitees: InviteeRecord[] = [
  {
    id: 'g-1',
    name: 'Guest 00',
    dependents: [
      { id: 'd-1', name: 'Dependent Alpha', included: true },
      { id: 'd-2', name: 'Dependent Beta', included: false },
    ],
    status: 'RSVP_YES',
  },
  {
    id: 'g-2',
    name: 'Guest 01',
    dependents: [],
    status: 'PENDING',
  },
];

describe('formatGuestHierarchyText utility', () => {
  it('formats primary guests and all dependents when filterIncludedOnly is false', () => {
    const text = formatGuestHierarchyText(sampleInvitees, false);
    const expected = [
      '|',
      '|_ Guest 00',
      '         |_ Dependent Alpha',
      '         |_ Dependent Beta',
      '|',
      '|_ Guest 01',
    ].join('\n');

    expect(text).toBe(expected);
  });

  it('formats only checked dependents when filterIncludedOnly is true', () => {
    const text = formatGuestHierarchyText(sampleInvitees, true);
    const expected = [
      '|',
      '|_ Guest 00',
      '         |_ Dependent Alpha',
      '|',
      '|_ Guest 01',
    ].join('\n');

    expect(text).toBe(expected);
  });

  it('handles empty invitees array', () => {
    expect(formatGuestHierarchyText([])).toBe('No guests in roster.');
  });
});

describe('GuestHierarchyTreeView component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders primary guests and all dependents when viewing All', () => {
    render(<GuestHierarchyTreeView invitees={sampleInvitees} />);

    expect(screen.getByText('Guest 00')).toBeTruthy();
    expect(screen.getByText('Guest 01')).toBeTruthy();
    expect(screen.getByText('Dependent Alpha')).toBeTruthy();
    expect(screen.getByText('Dependent Beta')).toBeTruthy();
    expect(screen.getByText(/2 primary • 2 dependents \(4 total\)/i)).toBeTruthy();
  });

  it('renders empty state when no invitees exist in roster', () => {
    render(<GuestHierarchyTreeView invitees={[]} />);
    expect(screen.getByText(/No guests added yet/i)).toBeTruthy();
  });

  it('excludes unchecked dependents when Confirmed filter is active', () => {
    render(<GuestHierarchyTreeView invitees={sampleInvitees} />);

    // Click Confirmed filter pill
    const confirmedPill = screen.getByRole('button', { name: /Confirmed/i });
    fireEvent.click(confirmedPill);

    expect(screen.getByText('Guest 00')).toBeTruthy();
    expect(screen.getByText('Dependent Alpha')).toBeTruthy();
    // Dependent Beta is unchecked (included: false) -> should NOT be shown in confirmed list
    expect(screen.queryByText('Dependent Beta')).toBeNull();
    expect(screen.queryByText('Guest 01')).toBeNull();
    expect(screen.getByText(/Showing 1 of 2 primary \(2 total attending\)/i)).toBeTruthy();
  });

  it('filters guests by Pending status', () => {
    render(<GuestHierarchyTreeView invitees={sampleInvitees} />);

    const pendingPill = screen.getByRole('button', { name: /Pending/i });
    fireEvent.click(pendingPill);

    expect(screen.queryByText('Guest 00')).toBeNull();
    expect(screen.getByText('Guest 01')).toBeTruthy();
  });

  it('shows empty filter state and allows resetting to All', () => {
    render(<GuestHierarchyTreeView invitees={sampleInvitees} />);

    // Click Declined filter pill (which has 0 matches)
    const declinedPill = screen.getByRole('button', { name: /Declined/i });
    fireEvent.click(declinedPill);

    expect(screen.getByText(/No guests found with status/i)).toBeTruthy();

    // Click reset button
    const showAllBtn = screen.getByRole('button', { name: /Show All Guests/i });
    fireEvent.click(showAllBtn);

    expect(screen.getByText('Guest 00')).toBeTruthy();
    expect(screen.getByText('Guest 01')).toBeTruthy();
  });

  it('copies only checked dependents to clipboard when Confirmed filter is active', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<GuestHierarchyTreeView invitees={sampleInvitees} />);

    // Filter by Confirmed
    const confirmedPill = screen.getByRole('button', { name: /Confirmed/i });
    fireEvent.click(confirmedPill);

    const copyBtn = screen.getByRole('button', { name: /Copy as Text/i });
    fireEvent.click(copyBtn);

    // Only Guest 00 and Dependent Alpha should be copied
    expect(writeTextMock).toHaveBeenCalledWith(['|', '|_ Guest 00', '         |_ Dependent Alpha'].join('\n'));
  });
});
