import { describe, it, expect } from 'vitest';
import { normalizeDesign, inferItineraryKind, isNormalized, LEGACY_SECTION_ORDER, LEGACY_MEAL_OPTIONS } from './normalizeDesign';
import { LEGACY_WEDDING_DEFAULT } from './__fixtures__/legacyWeddingDefault';
import { createDesignFromTemplate, EVENT_TEMPLATE_ORDER } from '../templates';
import type { InvitationDesign } from '../types/sigil.types';

describe('normalizeDesign — legacy wedding', () => {
  const out = normalizeDesign(LEGACY_WEDDING_DEFAULT);

  it('is treated as WEDDING', () => {
    expect(out.eventType).toBe('WEDDING');
  });

  it('builds sections in the legacy render order with legacy visibility', () => {
    expect(out.sections!.map((s) => s.kind)).toEqual(LEGACY_SECTION_ORDER);
    expect(out.sections!.every((s) => s.enabled)).toBe(true); // wedding default had all six visible
  });

  it('migrates the male/female dress code into two groups and drops the legacy fields', () => {
    expect(out.dressCode?.intro).toBe('Formal');
    expect(out.dressCode?.groups.map((g) => g.label)).toEqual(['Ellos', 'Ellas']);
    expect(out.dressCode?.groups[1].avoidColors).toEqual(['#ffffff', '#f5f5dc', '#ffd1dc']);
    expect((out as unknown as Record<string, unknown>).dressCodeMaleHeading).toBeUndefined();
    expect((out as unknown as Record<string, unknown>).dressCodeText).toBeUndefined();
  });

  it('infers itinerary kinds from legacy titles', () => {
    expect(out.itinerary!.map((i) => i.kind)).toEqual(['CEREMONY', 'RECEPTION']);
  });

  it('equals the WEDDING/ES template field for field', () => {
    expect(out).toEqual(createDesignFromTemplate('WEDDING', 'ES'));
  });

  it('is idempotent and returns the same reference when already normalised', () => {
    expect(isNormalized(out)).toBe(true);
    expect(normalizeDesign(out)).toBe(out);
  });
});

describe('normalizeDesign — edge cases', () => {
  it('hides GIFTS and DRESS_CODE when the legacy fields were empty', () => {
    const legacy: InvitationDesign = {
      ...LEGACY_WEDDING_DEFAULT,
      registryText: '',
      dressCodeText: '',
      dressCodeMaleHeading: '',
      dressCodeMaleText: '',
      dressCodeFemaleHeading: '',
      dressCodeFemaleText: '',
    };
    const out = normalizeDesign(legacy);
    const byKind = Object.fromEntries(out.sections!.map((s) => [s.kind, s.enabled]));
    expect(byKind.GIFTS).toBe(false);
    expect(byKind.DRESS_CODE).toBe(false);
    expect(out.dressCode).toBeUndefined();
  });

  it('supplies the legacy menu only when meal preference was on', () => {
    const on = normalizeDesign({ ...LEGACY_WEDDING_DEFAULT, rsvpFormConfig: { ...LEGACY_WEDDING_DEFAULT.rsvpFormConfig!, requireMealPreference: true } });
    expect(on.rsvpFormConfig?.mealOptions).toEqual(LEGACY_MEAL_OPTIONS.ES);
    const off = normalizeDesign(LEGACY_WEDDING_DEFAULT);
    expect(off.rsvpFormConfig?.mealOptions).toEqual([]);
  });

  it('maps unknown event types to CUSTOM and keeps explicit kinds', () => {
    const out = normalizeDesign({
      ...LEGACY_WEDDING_DEFAULT,
      eventType: 'PICNIC' as never,
      itinerary: [{ id: 'x', kind: 'TALK', title: 'Recepción', locationName: '', time: '10:00' }],
    });
    expect(out.eventType).toBe('CUSTOM');
    expect(out.itinerary![0].kind).toBe('TALK');
  });

  it('inferItineraryKind covers the legacy keywords', () => {
    expect(inferItineraryKind('Ceremonia Religiosa')).toBe('CEREMONY');
    expect(inferItineraryKind('Recepcion')).toBe('RECEPTION');
    expect(inferItineraryKind('Brindis')).toBe('PARTY');
    expect(inferItineraryKind('Cena')).toBe('DINNER');
    expect(inferItineraryKind('Keynote')).toBe('TALK');
    expect(inferItineraryKind('Paseo')).toBe('CUSTOM');
  });
});

describe('templates', () => {
  for (const type of EVENT_TEMPLATE_ORDER) {
    for (const lang of ['ES', 'EN'] as const) {
      it(`${type}/${lang} is normalised, has sections and a valid countdown`, () => {
        const d = createDesignFromTemplate(type, lang);
        expect(d.eventType).toBe(type);
        expect(d.language).toBe(lang);
        expect(isNormalized(d)).toBe(true);
        expect(normalizeDesign(d)).toBe(d);
        expect(d.sections!.filter((s) => s.enabled).length).toBeGreaterThan(0);
        expect(d.sections!.some((s) => s.kind === 'RSVP')).toBe(true);
        expect(Number.isNaN(new Date(d.countdownTarget!).getTime())).toBe(false);
        expect(d.itinerary!.every((i) => !!i.kind)).toBe(true);
      });
    }
  }

  it('templates differ in structure as specified', () => {
    const kinds = (t: Parameters<typeof createDesignFromTemplate>[0]) => createDesignFromTemplate(t, 'ES').sections!.map((s) => s.kind);
    expect(kinds('CORPORATE')).not.toContain('GIFTS');
    expect(kinds('CORPORATE')).toContain('TEXT');
    expect(kinds('BAPTISM')).toContain('TEXT');
    expect(kinds('CUSTOM')).toEqual(['COUNTDOWN', 'ITINERARY', 'RSVP']);
    expect(createDesignFromTemplate('BIRTHDAY', 'ES').rsvpFormConfig?.allowPlusOnes).toBe(true);
    expect(createDesignFromTemplate('CORPORATE', 'EN').rsvpFormConfig?.mealOptions).toEqual(['Meat', 'Fish', 'Vegetarian']);
    expect(createDesignFromTemplate('BIRTHDAY', 'ES').dressCode?.groups).toHaveLength(1);
  });
});
