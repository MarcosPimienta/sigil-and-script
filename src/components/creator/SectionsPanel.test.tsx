import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { SectionsPanel } from './SectionsPanel';
import { useSigilStore } from '../../state/sigilStore';
import { createDesignFromTemplate } from '../../templates';

const store = () => useSigilStore.getState();
const kinds = () => store().design.sections!.map((s) => s.kind);

beforeEach(() => {
  useSigilStore.setState({
    design: createDesignFromTemplate('WEDDING', 'ES'),
    inspectorFocus: { type: 'NONE' },
  });
});

describe('SectionsPanel', () => {
  it('lists the template sections in order', () => {
    render(<SectionsPanel />);
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(6);
    expect(rows[0].textContent).toContain('Música');
    expect(rows[2].textContent).toContain('Programa');
  });

  it('adds a section from the palette', () => {
    render(<SectionsPanel />);
    fireEvent.click(screen.getByRole('button', { name: /agregar/i }));
    const palette = screen.getByRole('group', { name: /tipos de sección/i });
    fireEvent.click(within(palette).getByText('Video'));
    expect(kinds()).toContain('VIDEO');
  });

  it('blocks a second music section and says why', () => {
    render(<SectionsPanel />);
    fireEvent.click(screen.getByRole('button', { name: /agregar/i }));
    const palette = screen.getByRole('group', { name: /tipos de sección/i });
    const musicOption = within(palette).getByText('Música').closest('button')!;
    expect(musicOption).toBeDisabled();
    expect(musicOption.textContent).toMatch(/ya agregada/i);
    fireEvent.click(musicOption);
    expect(kinds().filter((k) => k === 'AUDIO')).toHaveLength(1);
  });

  it('hides and shows a section', () => {
    render(<SectionsPanel />);
    const row = screen.getAllByRole('listitem')[0];
    fireEvent.click(within(row).getByRole('button', { name: /ocultar/i }));
    expect(store().design.sections![0].enabled).toBe(false);
    fireEvent.click(within(row).getByRole('button', { name: /mostrar/i }));
    expect(store().design.sections![0].enabled).toBe(true);
  });

  it('moves a section down and removes one', () => {
    render(<SectionsPanel />);
    const first = kinds()[0];
    fireEvent.click(within(screen.getAllByRole('listitem')[0]).getByRole('button', { name: /bajar/i }));
    expect(kinds()[1]).toBe(first);

    const before = kinds().length;
    fireEvent.click(within(screen.getAllByRole('listitem')[0]).getByRole('button', { name: /quitar/i }));
    expect(kinds()).toHaveLength(before - 1);
  });

  it('focuses a section when its name is clicked', () => {
    render(<SectionsPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Programa' }));
    expect(store().inspectorFocus).toEqual({
      type: 'SECTION',
      sectionId: store().design.sections!.find((s) => s.kind === 'ITINERARY')!.id,
    });
  });

  it('warns about duplicate and missing RSVP forms', () => {
    render(<SectionsPanel />);
    expect(screen.queryByRole('status')).toBeNull();

    act(() => {
      store().addSection('RSVP');
    });
    expect(screen.getByRole('status').textContent).toMatch(/verán dos/i);

    act(() => {
      for (const s of store().design.sections!.filter((x) => x.kind === 'RSVP')) {
        store().toggleSection(s.id, false);
      }
    });
    expect(screen.getByRole('status').textContent).toMatch(/no podrán responder/i);
  });
});
