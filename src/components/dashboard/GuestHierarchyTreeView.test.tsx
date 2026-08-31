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
      { id: 'd-2', name: 'Dependent Beta', included: true },
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
  it('formats primary guests and dependents into indented tree text format', () => {
    const text = formatGuestHierarchyText(sampleInvitees);
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

  it('handles empty invitees array', () => {
    expect(formatGuestHierarchyText([])).toBe('No guests in roster.');
  });
});

describe('GuestHierarchyTreeView component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders primary guests and nested dependents', () => {
    render(<GuestHierarchyTreeView invitees={sampleInvitees} />);

    expect(screen.getByText('Guest 00')).toBeTruthy();
    expect(screen.getByText('Guest 01')).toBeTruthy();
    expect(screen.getByText('Dependent Alpha')).toBeTruthy();
    expect(screen.getByText('Dependent Beta')).toBeTruthy();
    expect(screen.getByText(/2 primary guests • 2 dependents \(4 total\)/i)).toBeTruthy();
  });

  it('renders empty state when no invitees exist', () => {
    render(<GuestHierarchyTreeView invitees={[]} />);
    expect(screen.getByText(/No guests added yet/i)).toBeTruthy();
  });

  it('copies hierarchy text to clipboard when clicking copy button', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<GuestHierarchyTreeView invitees={sampleInvitees} />);

    const copyBtn = screen.getByRole('button', { name: /Copy as Text/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      ['|', '|_ Guest 00', '         |_ Dependent Alpha', '         |_ Dependent Beta', '|', '|_ Guest 01'].join('\n')
    );
  });
});
