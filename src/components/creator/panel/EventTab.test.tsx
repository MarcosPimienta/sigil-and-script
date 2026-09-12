import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventTab } from './EventTab';
import { PanelShell } from './PanelShell';
import { useSigilStore } from '../../../state/sigilStore';
import { createDesignFromTemplate } from '../../../templates';

const store = () => useSigilStore.getState();

beforeEach(() => {
  useSigilStore.setState({
    design: createDesignFromTemplate('WEDDING', 'ES'),
    inspectorFocus: { type: 'NONE' },
    panelTab: 'EVENT',
    guest: { ...store().guest, guestName: 'Invitado', eventLocation: '' },
  });
});

describe('EventTab', () => {
  it('changes the event type without discarding the content', () => {
    const before = store().design.sections!.length;
    render(<EventTab />);
    fireEvent.click(screen.getByRole('radio', { name: /cumpleaños/i }));
    expect(store().design.eventType).toBe('BIRTHDAY');
    expect(store().design.sections).toHaveLength(before);
  });

  it('saves the RSVP deadline on the design, not just the preview', () => {
    // The old panel wrote this to the preview guest payload, which is rebuilt
    // from the design on every load — so the host's edit was thrown away.
    render(<EventTab />);
    fireEvent.change(screen.getByLabelText(/confirmar antes del/i), {
      target: { value: '31 de enero' },
    });
    expect(store().design.rsvpDeadline).toBe('31 de enero');
    expect(store().guest.rsvpBy).toBe('31 de enero');
  });

  it('keeps the countdown and the preview date in step', () => {
    render(<EventTab />);
    fireEvent.change(screen.getByLabelText(/fecha y hora/i), {
      target: { value: '2027-02-14T17:00' },
    });
    expect(store().design.countdownTarget).toBe('2027-02-14T17:00');
    expect(store().guest.eventDate).toMatch(/2027/);
  });

  it('switches language', () => {
    render(<EventTab />);
    fireEvent.click(screen.getByRole('button', { name: /inglés/i }));
    expect(store().design.language).toBe('EN');
  });
});

describe('PanelShell', () => {
  it('switches tabs', () => {
    render(<PanelShell />);
    fireEvent.click(screen.getByRole('tab', { name: /estilo/i }));
    expect(store().panelTab).toBe('STYLE');
  });

  it('brings the Secciones tab forward when a section is clicked in the preview', () => {
    useSigilStore.setState({ panelTab: 'STYLE' });
    render(<PanelShell />);
    const target = store().design.sections![0];
    fireEvent.click(screen.getByRole('tab', { name: /estilo/i }));
    expect(store().panelTab).toBe('STYLE');

    // What SectionStack does when the host clicks a section on the stage.
    store().focusInspector({ type: 'SECTION', sectionId: target.id });
    expect(store().panelTab).toBe('SECTIONS');
  });
});
