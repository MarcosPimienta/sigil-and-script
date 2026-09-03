import { describe, it, expect, beforeEach } from 'vitest';
import { useSigilStore } from './sigilStore';
import { createDesignFromTemplate } from '../templates';

const get = () => useSigilStore.getState();
const kinds = () => get().design.sections!.map((s) => s.kind);
const ids = () => get().design.sections!.map((s) => s.id);

beforeEach(() => {
  useSigilStore.setState({
    design: createDesignFromTemplate('WEDDING', 'ES'),
    inspectorFocus: { type: 'NONE' },
  });
});

describe('section actions', () => {
  it('appends a section, focuses it and returns its id', () => {
    const before = kinds().length;
    const id = get().addSection('TEXT');
    expect(id).toBeTruthy();
    expect(kinds()).toHaveLength(before + 1);
    expect(kinds().at(-1)).toBe('TEXT');
    expect(get().inspectorFocus).toEqual({ type: 'SECTION', sectionId: id });
  });

  it('inserts at an index when asked', () => {
    get().addSection('DIVIDER', 0);
    expect(kinds()[0]).toBe('DIVIDER');
  });

  it('refuses a second music section but allows repeats of everything else', () => {
    expect(kinds()).toContain('AUDIO');
    expect(get().addSection('AUDIO')).toBeNull();
    expect(kinds().filter((k) => k === 'AUDIO')).toHaveLength(1);

    for (const kind of ['VIDEO', 'TEXT', 'RSVP', 'COUNTDOWN', 'ITINERARY', 'GIFTS', 'DRESS_CODE', 'IMAGE', 'DIVIDER'] as const) {
      expect(get().addSection(kind), kind).toBeTruthy();
      expect(get().addSection(kind), `${kind} again`).toBeTruthy();
    }
    expect(kinds().filter((k) => k === 'RSVP').length).toBeGreaterThan(1);
  });

  it('gives repeated sections distinct ids', () => {
    get().addSection('VIDEO');
    get().addSection('VIDEO');
    const videoIds = get().design.sections!.filter((s) => s.kind === 'VIDEO').map((s) => s.id);
    expect(new Set(videoIds).size).toBe(videoIds.length);
  });

  it('moves a section up and down, and ignores moves past the ends', () => {
    const [first, second] = ids();
    get().moveSection(second, 'up');
    expect(ids().slice(0, 2)).toEqual([second, first]);
    get().moveSection(second, 'down');
    expect(ids().slice(0, 2)).toEqual([first, second]);
    get().moveSection(first, 'up');
    expect(ids()[0]).toBe(first);
    get().moveSection(ids().at(-1)!, 'down');
    expect(ids().at(-1)).toBe(ids().at(-1));
  });

  it('reorders by an explicit id list, keeping unmentioned sections at the end', () => {
    const [a, b, c] = ids();
    get().reorderSections([c, a]);
    expect(ids().slice(0, 2)).toEqual([c, a]);
    expect(ids()).toContain(b);
    expect(ids()).toHaveLength(6);
  });

  it('toggles visibility without losing content', () => {
    const id = ids()[2];
    get().toggleSection(id);
    expect(get().design.sections!.find((s) => s.id === id)!.enabled).toBe(false);
    get().toggleSection(id, true);
    expect(get().design.sections!.find((s) => s.id === id)!.enabled).toBe(true);
  });

  it('removes a section and clears the focus when it was focused', () => {
    const id = get().addSection('TEXT')!;
    expect(get().inspectorFocus).toEqual({ type: 'SECTION', sectionId: id });
    get().removeSection(id);
    expect(ids()).not.toContain(id);
    expect(get().inspectorFocus).toEqual({ type: 'NONE' });
  });

  it('updates title and props but never the id or kind', () => {
    const id = get().addSection('TEXT')!;
    get().updateSection(id, { title: 'Nuestra historia', props: { kind: 'TEXT', content: 'Hola', fontFamily: 'serif', fontSize: 1, fontStyle: 'normal', color: 'DARK_INK', textAlign: 'left' } });
    const section = get().design.sections!.find((s) => s.id === id)!;
    expect(section.title).toBe('Nuestra historia');
    expect(section.kind).toBe('TEXT');
    if (section.props.kind !== 'TEXT') throw new Error('kind changed');
    expect(section.props.content).toBe('Hola');

    get().updateSection(id, { id: 'hacked', kind: 'IMAGE' } as never);
    const after = get().design.sections!.find((s) => s.id === id)!;
    expect(after.kind).toBe('TEXT');
  });
});
