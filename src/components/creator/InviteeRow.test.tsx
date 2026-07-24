import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InviteeRow } from './InviteeRow';
import type { InviteeRecord } from '../../types/sigil.types';

const mockRemoveInvitee = vi.fn();
const mockAddDependent = vi.fn();
const mockToggleDependent = vi.fn();
const mockRemoveDependent = vi.fn();
const mockUpdateInvitee = vi.fn();

vi.mock('../../context/SigilContext', () => ({
  useSigil: () => ({
    removeInvitee: mockRemoveInvitee,
    addDependent: mockAddDependent,
    toggleDependent: mockToggleDependent,
    removeDependent: mockRemoveDependent,
    updateInvitee: mockUpdateInvitee,
  }),
}));

const baseInvitee: InviteeRecord = {
  id: 'inv-1',
  name: 'Sophie Martin',
  dependents: [],
  status: 'PENDING',
  language: 'ES',
};

beforeEach(() => {
  mockRemoveInvitee.mockClear();
  mockAddDependent.mockClear();
  mockUpdateInvitee.mockClear();
  vi.stubGlobal('confirm', vi.fn(() => true));
});

describe('InviteeRow', () => {
  it('renders the invitee name and status badge', () => {
    render(<InviteeRow invitee={baseInvitee} />);
    expect(screen.getByText(/Sophie Martin/i)).toBeTruthy();
  });

  it('renders the language switch and updates language on click', () => {
    render(<InviteeRow invitee={baseInvitee} />);
    const enBtn = screen.getByRole('button', { name: /set english for sophie martin/i });
    expect(enBtn).toBeTruthy();
    fireEvent.click(enBtn);
    expect(mockUpdateInvitee).toHaveBeenCalledWith('inv-1', { language: 'EN' });
  });

  it('dependents section hidden by default', () => {
    render(<InviteeRow invitee={baseInvitee} />);
    expect(screen.queryByLabelText(/add dependent/i)).toBeNull();
  });

  it('shows dependents section after toggle click', () => {
    render(<InviteeRow invitee={baseInvitee} />);
    fireEvent.click(screen.getByRole('button', { name: /dependents/i }));
    expect(screen.getByLabelText(/add dependent for sophie martin/i)).toBeTruthy();
  });

  it('calls removeInvitee after confirm dialog returns true', () => {
    render(<InviteeRow invitee={baseInvitee} />);
    fireEvent.click(screen.getByRole('button', { name: /remove sophie martin/i }));
    expect(mockRemoveInvitee).toHaveBeenCalledWith('inv-1');
  });

  it('does not call removeInvitee when confirm dialog is cancelled', () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    render(<InviteeRow invitee={baseInvitee} />);
    fireEvent.click(screen.getByRole('button', { name: /remove sophie martin/i }));
    expect(mockRemoveInvitee).not.toHaveBeenCalled();
  });

  it('calls addDependent with trimmed name after expanding and typing', () => {
    render(<InviteeRow invitee={baseInvitee} />);
    fireEvent.click(screen.getByRole('button', { name: /dependents/i }));
    fireEvent.change(screen.getByLabelText(/add dependent for sophie martin/i), {
      target: { value: '  Luca  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm add dependent/i }));
    expect(mockAddDependent).toHaveBeenCalledWith('inv-1', 'Luca');
  });
});
