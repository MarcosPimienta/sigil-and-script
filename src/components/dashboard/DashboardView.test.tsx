import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardView } from './DashboardView';
import type { InviteeRecord } from '../../types/sigil.types';

const mockInvitees: InviteeRecord[] = [
  { id: '1', name: 'Zoe', dependents: [], status: 'PENDING' },
  { id: '2', name: 'Alice', dependents: [{ id: 'd1', name: 'Bob', included: true }], status: 'OPENED' },
  { id: '3', name: 'Carlos', dependents: [{ id: 'd2', name: 'Dan', included: true }, { id: 'd3', name: 'Eve', included: true }], status: 'RSVP_YES' },
];

vi.mock('../../context/SigilContext', () => ({
  useSigil: () => ({
    updateInvitee: vi.fn(),
    removeInvitee: vi.fn(),
    addDependent: vi.fn(),
  }),
  useSigilSelector: (selector: (state: any) => any) =>
    selector({
      guestRoster: {
        invitees: mockInvitees,
      },
    }),
}));

describe('DashboardView Column Sorting', () => {
  it('renders sortable headers with carets', () => {
    render(<DashboardView />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Dependents')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.getByText('Opened At')).toBeTruthy();
  });

  it('sorts alphabetically by Name on header click', () => {
    render(<DashboardView />);
    const nameHeader = screen.getByText('Name');
    
    // Default is asc (Alice -> Carlos -> Zoe)
    fireEvent.click(nameHeader); // toggle to desc (Zoe -> Carlos -> Alice)
    const rowsDesc = screen.getAllByTitle('Click to edit name');
    expect(rowsDesc[0].textContent).toContain('Zoe');

    fireEvent.click(nameHeader); // toggle back to asc (Alice -> Carlos -> Zoe)
    const rowsAsc = screen.getAllByTitle('Click to edit name');
    expect(rowsAsc[0].textContent).toContain('Alice');
  });

  it('sorts numerically by Dependents count on header click', () => {
    render(<DashboardView />);
    const depHeader = screen.getByText('Dependents');
    
    fireEvent.click(depHeader); // asc (0 -> 1 -> 2)
    const rowsAsc = screen.getAllByTitle('Click to edit name');
    expect(rowsAsc[0].textContent).toContain('Zoe'); // 0 dependents

    fireEvent.click(depHeader); // desc (2 -> 1 -> 0)
    const rowsDesc = screen.getAllByTitle('Click to edit name');
    expect(rowsDesc[0].textContent).toContain('Carlos'); // 2 dependents
  });
});
