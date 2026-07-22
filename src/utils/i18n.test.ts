import { describe, it, expect } from 'vitest';
import { getTranslation } from './i18n';

describe('i18n translation utility', () => {
  it('defaults to Spanish (ES) when language is undefined or empty', () => {
    const t = getTranslation(undefined);
    expect(t.countdownTitle).toBe('La Celebración Comienza En');
    expect(t.days).toBe('DÍAS');
    expect(t.rsvpTitle).toBe('Confirmación de Asistencia');
  });

  it('returns English (EN) translations when language is EN', () => {
    const t = getTranslation('EN');
    expect(t.countdownTitle).toBe('The Celebration Begins In');
    expect(t.days).toBe('DAYS');
    expect(t.rsvpTitle).toBe('RSVP Response');
    expect(t.yesGladly).toBe('Yes');
  });

  it('returns Spanish (ES) translations when language is ES', () => {
    const t = getTranslation('ES');
    expect(t.countdownTitle).toBe('La Celebración Comienza En');
    expect(t.viewMap).toBe('Ver Mapa');
    expect(t.yesGladly).toBe('Sí');
  });
});
