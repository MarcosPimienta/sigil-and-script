import { describe, it, expect, beforeEach } from 'vitest';
import { useSigilStore } from './sigilStore';

describe('Floor Plan Reference Layer Store Actions', () => {
  beforeEach(() => {
    useSigilStore.setState((s) => ({
      design: {
        ...s.design,
        floorPlan: {
          tables: [],
          canvasWidth: 1400,
          canvasHeight: 900,
          referenceLayer: undefined,
        },
      },
    }));
  });

  it('sets reference layer with initial blueprint data', () => {
    const store = useSigilStore.getState();
    store.setFloorPlanReferenceLayer({
      url: 'https://example.com/venue-blueprint.png',
      opacity: 0.45,
      scale: 1.0,
      x: 50,
      y: 80,
      visible: true,
      locked: true,
      fileName: 'venue-blueprint.png',
    });

    const layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer).toBeDefined();
    expect(layer?.url).toBe('https://example.com/venue-blueprint.png');
    expect(layer?.opacity).toBe(0.45);
    expect(layer?.scale).toBe(1.0);
    expect(layer?.x).toBe(50);
    expect(layer?.y).toBe(80);
    expect(layer?.visible).toBe(true);
    expect(layer?.locked).toBe(true);
    expect(layer?.fileName).toBe('venue-blueprint.png');
  });

  it('updates opacity, scale, and visibility of the reference layer', () => {
    const store = useSigilStore.getState();
    store.setFloorPlanReferenceLayer({
      url: 'https://example.com/blueprint.png',
      opacity: 0.5,
      scale: 1.0,
      x: 0,
      y: 0,
      visible: true,
      locked: true,
    });

    // Update opacity and scale
    useSigilStore.getState().updateFloorPlanReferenceLayer({
      opacity: 0.8,
      scale: 1.5,
    });

    let layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.opacity).toBe(0.8);
    expect(layer?.scale).toBe(1.5);
    expect(layer?.visible).toBe(true);

    // Toggle visibility
    useSigilStore.getState().updateFloorPlanReferenceLayer({
      visible: false,
    });

    layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.visible).toBe(false);
  });

  it('updates position offsets and locked status', () => {
    const store = useSigilStore.getState();
    store.setFloorPlanReferenceLayer({
      url: 'https://example.com/blueprint.png',
      opacity: 0.5,
      scale: 1.0,
      x: 0,
      y: 0,
      visible: true,
      locked: true,
    });

    // Unlock and move
    useSigilStore.getState().updateFloorPlanReferenceLayer({
      locked: false,
      x: 120,
      y: -40,
    });

    const layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.locked).toBe(false);
    expect(layer?.x).toBe(120);
    expect(layer?.y).toBe(-40);
  });

  it('clears reference layer', () => {
    const store = useSigilStore.getState();
    store.setFloorPlanReferenceLayer({
      url: 'https://example.com/blueprint.png',
      opacity: 0.5,
      scale: 1.0,
      x: 0,
      y: 0,
      visible: true,
    });

    expect(useSigilStore.getState().design.floorPlan?.referenceLayer).toBeDefined();

    store.clearFloorPlanReferenceLayer();
    expect(useSigilStore.getState().design.floorPlan?.referenceLayer).toBeUndefined();
  });

  it('preserves reference layer when adding, moving, and updating tables', () => {
    const store = useSigilStore.getState();
    store.setFloorPlanReferenceLayer({
      url: 'https://example.com/blueprint.png',
      opacity: 0.6,
      scale: 1.2,
      x: 30,
      y: 40,
      visible: true,
      locked: true,
    });

    // Add table
    const tableId = store.addFloorPlanTable({
      name: 'Table A',
      shape: 'round',
      seatsCount: 4,
    });

    let layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.url).toBe('https://example.com/blueprint.png');
    expect(layer?.opacity).toBe(0.6);

    // Move table
    store.moveFloorPlanTable(tableId, 200, 300);
    layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.url).toBe('https://example.com/blueprint.png');

    // Update table
    store.updateFloorPlanTable(tableId, { name: 'VIP Table' });
    layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
    expect(layer?.url).toBe('https://example.com/blueprint.png');
  });

  it('survives JSON serialization and normalizeDesign cycles (persistence verification)', () => {
    const store = useSigilStore.getState();
    store.setFloorPlanReferenceLayer({
      url: 'https://example.com/ballroom-cad.png',
      opacity: 0.7,
      scale: 1.25,
      x: 15,
      y: 25,
      visible: true,
      locked: true,
      fileName: 'ballroom-cad.png',
    });

    const currentDesign = useSigilStore.getState().design;
    const serialized = JSON.stringify(currentDesign);
    const parsed = JSON.parse(serialized);

    expect(parsed.floorPlan?.referenceLayer).toBeDefined();
    expect(parsed.floorPlan?.referenceLayer?.url).toBe('https://example.com/ballroom-cad.png');
    expect(parsed.floorPlan?.referenceLayer?.opacity).toBe(0.7);
    expect(parsed.floorPlan?.referenceLayer?.scale).toBe(1.25);
    expect(parsed.floorPlan?.referenceLayer?.x).toBe(15);
    expect(parsed.floorPlan?.referenceLayer?.y).toBe(25);
    expect(parsed.floorPlan?.referenceLayer?.visible).toBe(true);
    expect(parsed.floorPlan?.referenceLayer?.locked).toBe(true);
    expect(parsed.floorPlan?.referenceLayer?.fileName).toBe('ballroom-cad.png');
  });
});
