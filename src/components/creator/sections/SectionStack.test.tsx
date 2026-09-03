import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionStack } from './SectionStack';
import { useSigilStore } from '../../../state/sigilStore';
import { createDesignFromTemplate } from '../../../templates';

vi.mock('../AudioControls', () => ({ AudioControls: () => <div data-testid="audio" /> }));
vi.mock('../CountdownTimer', () => ({ CountdownTimer: () => <div data-testid="countdown" /> }));
vi.mock('../ItineraryTimeline', () => ({ ItineraryTimeline: () => <div data-testid="itinerary" /> }));
vi.mock('../DressCodePanel', () => ({ DressCodePanel: () => <div data-testid="dress" /> }));
vi.mock('../GiftsRegistryPanel', () => ({ GiftsRegistryPanel: () => <div data-testid="gifts" /> }));
vi.mock('../RecipientRsvpPanel', () => ({
  RecipientRsvpPanel: ({ idPrefix }: { idPrefix?: string }) => <div data-testid="rsvp" data-prefix={idPrefix} />,
}));

const store = () => useSigilStore.getState();

beforeEach(() => {
  useSigilStore.setState({
    design: createDesignFromTemplate('WEDDING', 'ES'),
    inspectorFocus: { type: 'NONE' },
  });
});

function orderOfKinds() {
  return Array.from(document.querySelectorAll('[data-section-kind]')).map(
    (el) => el.getAttribute('data-section-kind'),
  );
}

describe('SectionStack', () => {
  it('renders every enabled section in array order for guests', () => {
    render(<SectionStack mode="recipient" />);
    expect(screen.getByTestId('audio')).toBeInTheDocument();
    expect(screen.getByTestId('countdown')).toBeInTheDocument();
    expect(screen.getByTestId('itinerary')).toBeInTheDocument();
    expect(screen.getByTestId('rsvp')).toBeInTheDocument();
  });

  it('reflects a reorder immediately', () => {
    const sections = store().design.sections!;
    store().reorderSections([sections[2].id, sections[0].id]);
    render(<SectionStack mode="host" />);
    expect(orderOfKinds().slice(0, 2)).toEqual(['ITINERARY', 'AUDIO']);
  });

  it('hides disabled sections from guests but shows them dimmed and tagged to hosts', () => {
    const gifts = store().design.sections!.find((s) => s.kind === 'GIFTS')!;
    store().toggleSection(gifts.id, false);

    const guest = render(<SectionStack mode="recipient" />);
    expect(screen.queryByTestId('gifts')).toBeNull();
    guest.unmount();

    render(<SectionStack mode="host" />);
    expect(screen.getByTestId('gifts')).toBeInTheDocument();
    expect(screen.getByText('Oculta')).toBeInTheDocument();
  });

  it('scopes RSVP field ids per section so duplicates stay valid', () => {
    const secondId = store().addSection('RSVP')!;
    render(<SectionStack mode="recipient" />);
    const prefixes = screen.getAllByTestId('rsvp').map((el) => el.getAttribute('data-prefix'));
    expect(prefixes).toHaveLength(2);
    expect(new Set(prefixes).size).toBe(2);
    expect(prefixes).toContain(secondId);
  });

  it('renders a video section from its props', () => {
    const id = store().addSection('VIDEO')!;
    store().updateSection(id, {
      title: 'Nuestro video',
      props: { kind: 'VIDEO', src: 'abc123', provider: 'YOUTUBE' },
    });
    render(<SectionStack mode="recipient" />);
    const iframe = document.querySelector('iframe')!;
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute('src')).toContain('youtube-nocookie.com/embed/abc123');
    expect(screen.getByText('Nuestro video')).toBeInTheDocument();
  });

  it('renders text and divider sections', () => {
    const textId = store().addSection('TEXT')!;
    store().updateSection(textId, {
      props: { kind: 'TEXT', content: 'Gracias por acompañarnos', fontFamily: 'serif', fontSize: 1.2, fontStyle: 'italic', color: 'DARK_INK', textAlign: 'center' },
    });
    store().addSection('DIVIDER');
    render(<SectionStack mode="recipient" />);
    expect(screen.getByText('Gracias por acompañarnos')).toBeInTheDocument();
    expect(document.querySelector('.section-divider')).toBeTruthy();
  });

  it('applies per-section font variables and leaves other sections alone', () => {
    const sections = store().design.sections!;
    const itinerary = sections.find((s) => s.kind === 'ITINERARY')!;
    store().updateSection(itinerary.id, {
      fonts: { heading: "'Cinzel Decorative', serif", body: 'Georgia, serif' },
    });
    render(<SectionStack mode="recipient" />);

    const wrappers = Array.from(document.querySelectorAll('div[style*="--sec-"]')) as HTMLElement[];
    expect(wrappers).toHaveLength(1);
    expect(wrappers[0].style.getPropertyValue('--sec-heading-font')).toBe("'Cinzel Decorative', serif");
    expect(wrappers[0].style.getPropertyValue('--sec-body-font')).toBe('Georgia, serif');
  });

  it("lets a section body font win over a text block's own legacy font", () => {
    const id = store().addSection('TEXT')!;
    store().updateSection(id, {
      props: { kind: 'TEXT', content: 'Hola', fontFamily: "'Pinyon Script', cursive", fontSize: 1, fontStyle: 'normal', color: 'DARK_INK', textAlign: 'center' },
    });
    const first = render(<SectionStack mode="recipient" />);
    expect(screen.getByText('Hola').style.fontFamily).toContain('Pinyon Script');
    first.unmount();

    store().updateSection(id, { fonts: { body: 'Georgia, serif' } });
    render(<SectionStack mode="recipient" />);
    expect(screen.getByText('Hola').style.fontFamily).toContain('Georgia');
  });
});
