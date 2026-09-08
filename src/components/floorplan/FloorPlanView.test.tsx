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

  it('toggles blueprint reference controls panel and displays empty state', () => {
    render(<FloorPlanView />);

    // Blueprint panel is closed initially
    expect(screen.queryByTestId('blueprint-controls-panel')).not.toBeInTheDocument();

    // Click Blueprint button in header
    fireEvent.click(screen.getByTestId('toggle-reference-controls-btn'));
    expect(screen.getByTestId('blueprint-controls-panel')).toBeInTheDocument();
    expect(screen.getByText('Venue Blueprint Reference')).toBeInTheDocument();
    expect(screen.getByTestId('upload-blueprint-btn')).toBeInTheDocument();

    // Close panel
    fireEvent.click(screen.getByTestId('close-blueprint-panel-btn'));
    expect(screen.queryByTestId('blueprint-controls-panel')).not.toBeInTheDocument();
  });

  it('renders reference blueprint layer on canvas and allows adjusting opacity, scale, visibility, and removal', () => {
    // Initialize with a reference layer
    useSigilStore.getState().setFloorPlanReferenceLayer({
      url: 'https://example.com/blueprint-sample.png',
      opacity: 0.5,
      scale: 1.0,
      x: 20,
      y: 30,
      visible: true,
      locked: true,
      fileName: 'banquet-blueprint.png',
    });

    render(<FloorPlanView />);

    // Layer renders on canvas behind tables
    const layer = screen.getByTestId('floorplan-reference-layer');
    expect(layer).toBeInTheDocument();
    expect(layer.querySelector('img')).toHaveAttribute('src', 'https://example.com/blueprint-sample.png');

    // Open reference controls panel
    fireEvent.click(screen.getByTestId('toggle-reference-controls-btn'));
    expect(screen.getByTestId('blueprint-controls-panel')).toBeInTheDocument();
    expect(screen.getByText(/banquet-blueprint\.png/)).toBeInTheDocument();

    // 1. Toggle visibility off
    const visBtn = screen.getByTestId('toggle-blueprint-visibility');
    fireEvent.click(visBtn);
    expect(screen.queryByTestId('floorplan-reference-layer')).not.toBeInTheDocument();

    // Toggle visibility back on
    fireEvent.click(visBtn);
    expect(screen.getByTestId('floorplan-reference-layer')).toBeInTheDocument();

    // 2. Adjust Opacity slider
    const opacitySlider = screen.getByTestId('blueprint-opacity-slider');
    fireEvent.change(opacitySlider, { target: { value: '0.8' } });
    expect(useSigilStore.getState().design.floorPlan?.referenceLayer?.opacity).toBe(0.8);

    // 3. Adjust Scale slider
    const scaleSlider = screen.getByTestId('blueprint-scale-slider');
    fireEvent.change(scaleSlider, { target: { value: '1.4' } });
    expect(useSigilStore.getState().design.floorPlan?.referenceLayer?.scale).toBe(1.4);

    // 4. Toggle Lock
    const lockBtn = screen.getByTestId('toggle-blueprint-lock');
    fireEvent.click(lockBtn);
    expect(useSigilStore.getState().design.floorPlan?.referenceLayer?.locked).toBe(false);

    // 5. Remove Blueprint
    const removeBtn = screen.getByTestId('remove-blueprint-btn');
    fireEvent.click(removeBtn);
    expect(useSigilStore.getState().design.floorPlan?.referenceLayer).toBeUndefined();
    expect(screen.queryByTestId('floorplan-reference-layer')).not.toBeInTheDocument();
  });

  it('rotates table and adjusts seats count via inline steppers', () => {
    const tableId = useSigilStore.getState().addFloorPlanTable({
      name: 'Table 1',
      shape: 'round',
      seatsCount: 4,
    });

    render(<FloorPlanView />);

    // 1. Rotate table
    const rotateBtn = screen.getByTestId(`rotate-table-${tableId}`);
    fireEvent.click(rotateBtn);
    let table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
    expect(table?.rotation).toBe(45);

    fireEvent.click(rotateBtn);
    table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
    expect(table?.rotation).toBe(90);

    // 2. Inline seat stepper: decrease seats from 4 to 3
    const decBtn = screen.getByTestId(`decrease-seats-${tableId}`);
    fireEvent.click(decBtn);
    table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
    expect(table?.seatsCount).toBe(3);

    // 3. Inline seat stepper: increase seats from 3 back to 4
    const incBtn = screen.getByTestId(`increase-seats-${tableId}`);
    fireEvent.click(incBtn);
    table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
    expect(table?.seatsCount).toBe(4);
  });

  it('removes an individual seat slot from table via SeatAssignmentModal', () => {
    const tableId = useSigilStore.getState().addFloorPlanTable({
      name: 'Head Table',
      shape: 'rectangular',
      seatsCount: 4,
    });

    render(<FloorPlanView />);

    // Click seat 4
    const seat4 = screen.getByTestId(`seat-node-${tableId}-4`);
    fireEvent.click(seat4);

    // SeatAssignmentModal opens
    expect(screen.getByText('Seat Assignment')).toBeInTheDocument();
    const removeSeatBtn = screen.getByTestId('remove-seat-from-table-btn');
    expect(removeSeatBtn).toBeInTheDocument();

    // Click remove seat
    fireEvent.click(removeSeatBtn);

    // Modal closes and table capacity is reduced to 3
    expect(screen.queryByText('Seat Assignment')).not.toBeInTheDocument();
    const table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
    expect(table?.seatsCount).toBe(3);
    expect(screen.queryByTestId(`seat-node-${tableId}-4`)).not.toBeInTheDocument();
  });

  it('adjusts blueprint filters (invert, brightness, contrast, rotation, and reset)', () => {
    useSigilStore.getState().setFloorPlanReferenceLayer({
      url: 'https://example.com/cad-plan.png',
      opacity: 0.5,
      scale: 1.0,
      x: 0,
      y: 0,
      visible: true,
      locked: true,
      fileName: 'cad-plan.png',
    });

    render(<FloorPlanView />);

    // Open blueprint reference controls
    fireEvent.click(screen.getByTestId('toggle-reference-controls-btn'));
    expect(screen.getByTestId('blueprint-controls-panel')).toBeInTheDocument();

    // 1. Toggle Invert Colors
    const invertBtn = screen.getByTestId('toggle-blueprint-invert');
    fireEvent.click(invertBtn);
    let layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.invert).toBe(true);

    // 2. Adjust Brightness
    const brightnessSlider = screen.getByTestId('blueprint-brightness-slider');
    fireEvent.change(brightnessSlider, { target: { value: '1.25' } });
    layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.brightness).toBe(1.25);

    // 3. Adjust Contrast
    const contrastSlider = screen.getByTestId('blueprint-contrast-slider');
    fireEvent.change(contrastSlider, { target: { value: '1.6' } });
    layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.contrast).toBe(1.6);

    // 4. Rotate Blueprint 90°
    const rotateBtn = screen.getByTestId('rotate-blueprint-btn');
    fireEvent.click(rotateBtn);
    layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.rotation).toBe(90);

    // 5. Reset Filters
    const resetBtn = screen.getByTestId('reset-blueprint-filters');
    fireEvent.click(resetBtn);
    layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.brightness).toBe(1.0);
    expect(layer?.contrast).toBe(1.0);
    expect(layer?.invert).toBe(false);
    expect(layer?.rotation).toBe(0);
  });

  it('toggles the Seating Manifest modal from the header action button', () => {
    render(<FloorPlanView />);

    // Initially modal is not open
    expect(screen.queryByTestId('seating-manifest-modal')).not.toBeInTheDocument();

    // Click "📜 Seating Manifest" button
    const manifestBtn = screen.getByTestId('toggle-seating-manifest-btn');
    expect(manifestBtn).toBeInTheDocument();
    fireEvent.click(manifestBtn);

    // Modal is now open
    expect(screen.getByTestId('seating-manifest-modal')).toBeInTheDocument();
    expect(screen.getByText(/Seating Manifest & Guest Directory/i)).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByTestId('close-manifest-btn'));
    expect(screen.queryByTestId('seating-manifest-modal')).not.toBeInTheDocument();
  });
});
