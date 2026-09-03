import { describe, it, expect } from 'vitest';
import { getPhrasing, formatEventTitleFor, normalizeEventType, fillHosts, PHRASING_KEYS } from './eventPhrasing';
import { EVENT_TYPES } from '../types/sigil.types';

describe('eventPhrasing', () => {
  it('has every key for every type and language', () => {
    for (const type of EVENT_TYPES) {
      for (const lang of ['ES', 'EN'] as const) {
        const p = getPhrasing(type, lang) as unknown as Record<string, unknown>;
        for (const key of PHRASING_KEYS) {
          expect(p[key], `${type}/${lang}/${key}`).toBeDefined();
        }
        expect(Array.isArray(p.titleAliases)).toBe(true);
      }
    }
  });

  it('formats titles per type', () => {
    expect(formatEventTitleFor('Oscar & Rocio', 'WEDDING', 'ES')).toBe('Matrimonio de Oscar & Rocio');
    expect(formatEventTitleFor('Oscar & Rocio', 'WEDDING', 'EN')).toBe('Oscar & Rocio Wedding');
    expect(formatEventTitleFor('Sofía', 'BIRTHDAY', 'ES')).toBe('Cumpleaños de Sofía');
    expect(formatEventTitleFor('Sofía', 'BIRTHDAY', 'EN')).toBe("Sofía's Birthday");
    expect(formatEventTitleFor('Mateo', 'BAPTISM', 'ES')).toBe('Bautizo de Mateo');
    expect(formatEventTitleFor('Gala Anual Acme', 'CORPORATE', 'ES')).toBe('Gala Anual Acme');
    expect(formatEventTitleFor('Reunión', 'CUSTOM', 'EN')).toBe('Reunión');
  });

  it('falls back to the type noun for blank hosts', () => {
    expect(formatEventTitleFor('', 'WEDDING', 'ES')).toBe('Matrimonio');
    expect(formatEventTitleFor('  ', 'BIRTHDAY', 'EN')).toBe('Birthday');
    expect(formatEventTitleFor(undefined, 'CUSTOM', 'ES')).toBe('Evento');
  });

  it('keeps hosts text that already is an event title', () => {
    expect(formatEventTitleFor('Boda de Ana y Luis', 'WEDDING', 'ES')).toBe('Boda de Ana y Luis');
    expect(formatEventTitleFor('Matrimonio de Oscar & Rocio', 'WEDDING', 'EN')).toBe('Oscar & Rocio Wedding');
    expect(formatEventTitleFor('Oscar & Rocio Wedding', 'WEDDING', 'ES')).toBe('Matrimonio de Oscar & Rocio');
    expect(formatEventTitleFor('Matrimonio de Oscar & Rocio', 'WEDDING', 'ES')).toBe('Matrimonio de Oscar & Rocio');
    expect(formatEventTitleFor("Sofía's Birthday", 'BIRTHDAY', 'ES')).toBe('Cumpleaños de Sofía');
    expect(formatEventTitleFor('XV de Valentina', 'BIRTHDAY', 'ES')).toBe('XV de Valentina');
  });

  it('normalises unknown / missing event types', () => {
    expect(normalizeEventType(undefined)).toBe('WEDDING');
    expect(normalizeEventType(null)).toBe('WEDDING');
    expect(normalizeEventType('PICNIC')).toBe('CUSTOM');
    expect(normalizeEventType('BAPTISM')).toBe('BAPTISM');
  });

  it('fills hosts into phrasing strings', () => {
    expect(fillHosts(getPhrasing('BIRTHDAY', 'ES').notesPlaceholder, 'Sofía')).toBe('Deja un mensaje para Sofía');
  });
});
