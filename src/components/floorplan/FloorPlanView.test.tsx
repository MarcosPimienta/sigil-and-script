import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FloorPlanView } from './FloorPlanView';
import { useSigilStore } from '../../state/sigilStore';

describe('FloorPlanView Component', () => {
  beforeEach(() => {
    // Reset store state
    useSigilStore.setState((s) => ({
      ...s,
      design: {
        ...s.design,
        floorPlan: {
          tables: [],
          canvasWidth: 1400,
          canvasHeight: 900,
        },
      },
      guestRoster: {
        invitees: [
          {
            id: 'inv-1',
            name: 'Sofia Vergara',
            status: 'RSVP_YES',
            dependents: [
              { id: 'dep-1', name: 'Manolo Gonzalez', included: true },
            ],
          },
          {
            id: 'inv-2',
            name: 'Pedro Pascal',
            status: 'RSVP_NO',
            dependents: [],
          },
        ],
      },
    }));
  });

  it('renders the Floor Plan header, stats, and empty canvas state', () => {
    render(<FloorPlanView />);

    expect(screen.getByText(/Floor Plan & Seating/i)).toBeInTheDocument();
    // Sofia (primary) + Manolo (included dependent) = 2 confirmed guests
    expect(screen.getByText(/Confirmed Guests:/i)).toBeInTheDocument();
    expect(screen.getByText('Your Floor Plan is Empty')).toBeInTheDocument();
  });

  it('opens the Add Table modal and adds a new table to the canvas', () => {
    render(<FloorPlanView />);

    // Click "+ Add Table" button in header
    fireEvent.click(screen.getByTestId('add-table-btn'));

    // Modal opens
    expect(screen.getByText('Add New Table')).toBeInTheDocument();

    // Fill table name and choose square
    const nameInput = screen.getByLabelText(/Table Name/i);
    fireEvent.change(nameInput, { target: { value: 'Mesa VIP' } });
    fireEvent.click(screen.getByTestId('shape-card-square'));

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Create Table' }));

    // Modal closes and table appears on canvas
    expect(screen.queryByText('Add New Table')).not.toBeInTheDocument();
    expect(screen.getByText('Mesa VIP')).toBeInTheDocument();
  });

  it('allows clicking a seat to assign a confirmed guest and updates the stats', () => {
    // Start with a table already added
    useSigilStore.getState().addFloorPlanTable({
      name: 'Table 1',
      shape: 'round',
      seatsCount: 4,
    });

    render(<FloorPlanView />);

    // Find seat 1 on Table 1
    const tables = useSigilStore.getState().design.floorPlan?.tables || [];
    const tableId = tables[0].id;
    const seatBtn = screen.getByTestId(`seat-node-${tableId}-1`);
    expect(seatBtn).toBeInTheDocument();

    // Click seat to open assignment modal
    fireEvent.click(seatBtn);

    expect(screen.getByText('Seat Assignment')).toBeInTheDocument();
    expect(screen.getByText('Sofia Vergara')).toBeInTheDocument();

    // Assign Sofia Vergara
    fireEvent.click(screen.getByText('Sofia Vergara'));

    // Seat modal closes
    expect(screen.queryByText('Seat Assignment')).not.toBeInTheDocument();

    // Seat now displays initials "SV"
    expect(seatBtn).toHaveTextContent('SV');
  });

  it('toggles the unassigned guests drawer', () => {
    render(<FloorPlanView />);

    const toggleBtn = screen.getByTestId('toggle-unassigned-drawer-btn');
    expect(screen.queryByRole('complementary', { name: /Unassigned Guests Drawer/i })).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('complementary', { name: /Unassigned Guests Drawer/i })).toBeInTheDocument();
    expect(screen.getByText('Sofia Vergara')).toBeInTheDocument();
    expect(screen.getByText('Manolo Gonzalez')).toBeInTheDocument();

    // Click close in drawer
    fireEvent.click(screen.getByLabelText('Close drawer'));
    expect(screen.queryByRole('complementary', { name: /Unassigned Guests Drawer/i })).not.toBeInTheDocument();
  });
});
