import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { SectionsTab } from './SectionsTab';
import { useSigilStore } from '../../../state/sigilStore';
import { createDesignFromTemplate } from '../../../templates';
import { SECTION_CATALOGUE } from '../../../utils/sectionDefaults';

const store = () => useSigilStore.getState();
const kinds = () => store().design.sections!.map((s) => s.kind);

/** The tab shows the list only while nothing is focused. */
const backToList = () =>
  act(() => {
    store().focusInspector({ type: 'NONE' });
  });

beforeEach(() => {
  useSigilStore.setState({
    design: createDesignFromTemplate('WEDDING', 'ES'),
    inspectorFocus: { type: 'NONE' },
    panelTab: 'SECTIONS',
  });
});

describe('SectionsTab — the list', () => {
  it('lists the template sections in order', () => {
    render(<SectionsTab />);
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(6);
    expect(rows[0].textContent).toContain('Música');
    expect(rows[2].textContent).toContain('Programa');
  });

  it('hides and shows a section', () => {
    render(<SectionsTab />);
    const row = screen.getAllByRole('listitem')[0];
    fireEvent.click(within(row).getByRole('button', { name: /ocultar/i }));
    expect(store().design.sections![0].enabled).toBe(false);
    fireEvent.click(within(row).getByRole('button', { name: /mostrar/i }));
    expect(store().design.sections![0].enabled).toBe(true);
  });

  it('still reorders without a pointer, for keyboard users', () => {
    render(<SectionsTab />);
    const first = kinds()[0];
    fireEvent.click(within(screen.getAllByRole('listitem')[0]).getByRole('button', { name: /bajar/i }));
    expect(kinds()[1]).toBe(first);
  });

  it('warns about duplicate and missing RSVP forms', () => {
    render(<SectionsTab />);
    expect(screen.queryByRole('status')).toBeNull();

    act(() => {
      store().addSection('RSVP');
    });
    backToList();
    expect(screen.getByRole('status').textContent).toMatch(/verán dos/i);

    act(() => {
      for (const s of store().design.sections!.filter((x) => x.kind === 'RSVP')) {
        store().toggleSection(s.id, false);
      }
    });
    expect(screen.getByRole('status').textContent).toMatch(/no podrán responder/i);
  });
});

describe('SectionsTab — the palette', () => {
  const openPalette = () => {
    fireEvent.click(screen.getByRole('button', { name: /agregar/i }));
    return screen.getByRole('group', { name: /agregar una sección/i });
  };

  it('adds a section and drills straight into it', () => {
    render(<SectionsTab />);
    const palette = openPalette();
    fireEvent.click(within(palette).getByText('Video'));
    expect(kinds()).toContain('VIDEO');
    // Adding focuses the new section, so the inspector is what is showing.
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByRole('button', { name: /secciones/i })).toBeInTheDocument();
  });

  it('blocks a second music section and says why', () => {
    render(<SectionsTab />);
    const palette = openPalette();
    const musicOption = within(palette).getByText('Música').closest('button')!;
    expect(musicOption).toBeDisabled();
    expect(musicOption.textContent).toMatch(/ya agregada/i);
    fireEvent.click(musicOption);
    expect(kinds().filter((k) => k === 'AUDIO')).toHaveLength(1);
  });

  it('filters by search', () => {
    render(<SectionsTab />);
    openPalette();
    fireEvent.change(screen.getByLabelText(/buscar tipo de sección/i), { target: { value: 'video' } });
    const palette = screen.getByRole('group', { name: /agregar una sección/i });
    expect(within(palette).getAllByRole('button')).toHaveLength(1);
  });
});

describe('SectionsTab — the inspector', () => {
  it('replaces the list rather than appearing below it', () => {
    render(<SectionsTab />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Programa' }));
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('goes back to the list', () => {
    render(<SectionsTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Programa' }));
    fireEvent.click(screen.getByRole('button', { name: /^secciones$/i }));
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('carries the RSVP form controls, which used to be a separate panel', () => {
    render(<SectionsTab />);
    fireEvent.click(screen.getByRole('button', { name: /confirmación|rsvp/i }));
    const meal = screen.getByLabelText(/meal preference/i);
    fireEvent.click(meal);
    expect(store().design.rsvpFormConfig?.requireMealPreference).toBe(true);
  });

  it('offers typography for the section', () => {
    render(<SectionsTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Programa' }));
    fireEvent.click(screen.getByRole('tab', { name: /tipografía/i }));
    expect(screen.getByLabelText(/títulos/i)).toBeInTheDocument();
  });

  it('gives every catalogue kind something to edit', () => {
    for (const meta of SECTION_CATALOGUE) {
      useSigilStore.setState({
        design: createDesignFromTemplate('WEDDING', 'ES'),
        inspectorFocus: { type: 'NONE' },
      });
      let id: string | null = null;
      act(() => {
        // Singletons are already in the template; reuse the existing one.
        const existing = store().design.sections!.find((s) => s.kind === meta.kind);
        id = existing ? existing.id : store().addSection(meta.kind);
        if (existing) store().focusInspector({ type: 'SECTION', sectionId: existing.id });
      });
      expect(id, `no section for ${meta.kind}`).toBeTruthy();

      const view = render(<SectionsTab />);
      // A name field is the floor: no kind may render an empty inspector.
      const label = ['TEXT', 'IMAGE', 'VIDEO', 'RSVP'].includes(meta.kind)
        ? 'Título de la sección'
        : 'Nombre en la lista';
      expect(screen.getByLabelText(label), meta.kind).toBeInTheDocument();
      view.unmount();
    }
  });

  describe('deleting', () => {
    let confirmSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      confirmSpy = vi.spyOn(window, 'confirm');
    });
    afterEach(() => confirmSpy.mockRestore());

    it('asks first, and a refusal keeps the section', () => {
      confirmSpy.mockReturnValue(false);
      render(<SectionsTab />);
      const before = kinds().length;
      fireEvent.click(screen.getByRole('button', { name: 'Programa' }));
      fireEvent.click(screen.getByRole('button', { name: /eliminar sección/i }));
      expect(kinds()).toHaveLength(before);
    });

    it('removes the section and returns to the list', () => {
      confirmSpy.mockReturnValue(true);
      render(<SectionsTab />);
      const before = kinds().length;
      fireEvent.click(screen.getByRole('button', { name: 'Programa' }));
      fireEvent.click(screen.getByRole('button', { name: /eliminar sección/i }));
      expect(kinds()).toHaveLength(before - 1);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });
});
