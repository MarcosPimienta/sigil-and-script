import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeatingManifestModal } from './SeatingManifestModal';
import type { FloorPlanTable } from '../../types/sigil.types';
import type { ConfirmedAttendee } from '../../utils/floorPlanUtils';

describe('SeatingManifestModal', () => {
  const mockAttendees: ConfirmedAttendee[] = [
    { id: 'att-1', name: 'Zoe Saldana', isDependent: false, primaryInviteeId: 'att-1', primaryInviteeName: 'Zoe Saldana' },
    { id: 'att-2', name: 'Adam Driver', isDependent: false, primaryInviteeId: 'att-2', primaryInviteeName: 'Adam Driver' },
    { id: 'att-3', name: 'Ben Solo', isDependent: true, primaryInviteeId: 'att-2', primaryInviteeName: 'Adam Driver' },
    { id: 'att-4', name: 'Daisy Ridley', isDependent: false, primaryInviteeId: 'att-4', primaryInviteeName: 'Daisy Ridley' },
  ];

  const mockTables: FloorPlanTable[] = [
    {
      id: 'tbl-1',
      name: 'Head Table',
      shape: 'round',
      seatsCount: 3,
      x: 50,
      y: 50,
      seats: [
        { id: 'tbl-1-s-1', seatNumber: 1, assignedGuestId: 'att-2', assignedGuestName: 'Adam Driver' },
        { id: 'tbl-1-s-2', seatNumber: 2, assignedGuestId: 'att-3', assignedGuestName: 'Ben Solo', isDependent: true, primaryInviteeId: 'att-2' },
        { id: 'tbl-1-s-3', seatNumber: 3 }, // empty
      ],
    },
    {
      id: 'tbl-2',
      name: 'Garden Table',
      shape: 'square',
      seatsCount: 2,
      x: 200,
      y: 200,
      seats: [
        { id: 'tbl-2-s-1', seatNumber: 1, assignedGuestId: 'att-1', assignedGuestName: 'Zoe Saldana' },
        { id: 'tbl-2-s-2', seatNumber: 2 }, // empty
      ],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <SeatingManifestModal
        isOpen={false}
        onClose={vi.fn()}
        tables={mockTables}
        confirmedAttendees={mockAttendees}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, stats, and default "By Table" tab', () => {
    render(
      <SeatingManifestModal
        isOpen={true}
        onClose={vi.fn()}
        tables={mockTables}
        confirmedAttendees={mockAttendees}
      />
    );

    expect(screen.getByText(/Seating Manifest & Guest Directory/i)).toBeInTheDocument();
    // Stats
    expect(screen.getByText(/Confirmed:/i)).toHaveTextContent('4');
    expect(screen.getByText(/Seats:/i)).toHaveTextContent('5');
    expect(screen.getByText(/Seated:/i)).toHaveTextContent('3');
    expect(screen.getByText(/Unassigned:/i)).toHaveTextContent('1');

    // Check table cards
    expect(screen.getByText('Head Table')).toBeInTheDocument();
    expect(screen.getByText('Garden Table')).toBeInTheDocument();
    expect(screen.getByText('Adam Driver')).toBeInTheDocument();
    expect(screen.getByText('Ben Solo')).toBeInTheDocument();
    expect(screen.getAllByText('Empty Seat').length).toBe(2);
  });

  it('switches between "By Table" and "By Guest" tabs', () => {
    render(
      <SeatingManifestModal
        isOpen={true}
        onClose={vi.fn()}
        tables={mockTables}
        confirmedAttendees={mockAttendees}
      />
    );

    // Click By Guest tab
    fireEvent.click(screen.getByTestId('tab-by-guest'));

    // Guest table should appear
    expect(screen.getByTestId('manifest-guests-view')).toBeInTheDocument();
    expect(screen.getByText('Zoe Saldana')).toBeInTheDocument();
    expect(screen.getByText('Daisy Ridley')).toBeInTheDocument();

    // Daisy is unassigned
    expect(screen.getByText('⚠️ Unassigned')).toBeInTheDocument();

    // Click back to By Table tab
    fireEvent.click(screen.getByTestId('tab-by-table'));
    expect(screen.getByTestId('manifest-tables-view')).toBeInTheDocument();
  });

  it('filters tables and guests reactively via search query', () => {
    render(
      <SeatingManifestModal
        isOpen={true}
        onClose={vi.fn()}
        tables={mockTables}
        confirmedAttendees={mockAttendees}
      />
    );

    const searchInput = screen.getByTestId('manifest-search-input');

    // Filter for "Garden"
    fireEvent.change(searchInput, { target: { value: 'Garden' } });
    expect(screen.getByText('Garden Table')).toBeInTheDocument();
    expect(screen.queryByText('Head Table')).not.toBeInTheDocument();

    // Switch to By Guest and search for "Daisy"
    fireEvent.click(screen.getByTestId('tab-by-guest'));
    fireEvent.change(searchInput, { target: { value: 'Daisy' } });

    expect(screen.getByText('Daisy Ridley')).toBeInTheDocument();
    expect(screen.queryByText('Adam Driver')).not.toBeInTheDocument();
  });

  it('triggers window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <SeatingManifestModal
        isOpen={true}
        onClose={vi.fn()}
        tables={mockTables}
        confirmedAttendees={mockAttendees}
      />
    );

    fireEvent.click(screen.getByTestId('print-manifest-btn'));
    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it('triggers clipboard copy when copy button is clicked', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    });

    render(
      <SeatingManifestModal
        isOpen={true}
        onClose={vi.fn()}
        tables={mockTables}
        confirmedAttendees={mockAttendees}
      />
    );

    fireEvent.click(screen.getByTestId('copy-manifest-btn'));
    expect(writeTextSpy).toHaveBeenCalledTimes(1);
    expect(writeTextSpy.mock.calls[0][0]).toContain('=== SEATING MANIFEST ===');
  });

  it('calls onClose when close button is clicked or Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <SeatingManifestModal
        isOpen={true}
        onClose={onClose}
        tables={mockTables}
        confirmedAttendees={mockAttendees}
      />
    );

    // Click close button
    fireEvent.click(screen.getByTestId('close-manifest-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
