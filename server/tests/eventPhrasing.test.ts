import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getPhrasing, formatEventTitleFor, PHRASING_KEYS } from '../src/utils/eventPhrasing';
import serverCopy from '../shared/eventPhrasing.json';

const TYPES = ['WEDDING', 'BIRTHDAY', 'BAPTISM', 'CORPORATE', 'CUSTOM'] as const;

describe('server eventPhrasing', () => {
  it('has every key for every type and language', () => {
    for (const type of TYPES) {
      for (const lang of ['ES', 'EN'] as const) {
        const p = getPhrasing(type, lang) as unknown as Record<string, unknown>;
        for (const key of PHRASING_KEYS) expect(p[key], `${type}/${lang}/${key}`).toBeDefined();
      }
    }
  });

  it('formats titles like the client', () => {
    expect(formatEventTitleFor('Oscar & Rocio', 'WEDDING', 'ES')).toBe('Matrimonio de Oscar & Rocio');
    expect(formatEventTitleFor('Sofía', 'BIRTHDAY', 'EN')).toBe("Sofía's Birthday");
    expect(formatEventTitleFor('', 'BAPTISM', 'ES')).toBe('Bautizo');
    expect(formatEventTitleFor('Gala 2027', 'CORPORATE', 'ES')).toBe('Gala 2027');
  });

  it('server copy matches the repo-level shared file (run `npm run phrasing:sync` at the root if not)', () => {
    const rootFile = join(__dirname, '..', '..', 'shared', 'eventPhrasing.json');
    if (!existsSync(rootFile)) return; // deployed builds ship only the server copy
    const root = JSON.parse(readFileSync(rootFile, 'utf8'));
    expect(serverCopy).toEqual(root);
  });
});
