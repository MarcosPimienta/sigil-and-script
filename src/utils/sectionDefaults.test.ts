import { describe, it, expect } from 'vitest';
import {
  SECTION_CATALOGUE,
  createSection,
  defaultPropsFor,
  getSectionMeta,
  isSingletonKind,
  parseVideoUrl,
  videoEmbedUrl,
  MAX_VIDEO_BYTES,
} from './sectionDefaults';
import { SECTION_KINDS } from '../types/sigil.types';

describe('section catalogue', () => {
  it('covers every section kind exactly once, with both languages', () => {
    expect(SECTION_CATALOGUE.map((m) => m.kind).sort()).toEqual([...SECTION_KINDS].sort());
    for (const meta of SECTION_CATALOGUE) {
      expect(meta.label.ES).toBeTruthy();
      expect(meta.label.EN).toBeTruthy();
      expect(meta.description.ES).toBeTruthy();
      expect(meta.description.EN).toBeTruthy();
    }
  });

  it('marks only music as one-per-invitation', () => {
    expect(SECTION_CATALOGUE.filter((m) => m.singleton).map((m) => m.kind)).toEqual(['AUDIO']);
    expect(isSingletonKind('AUDIO')).toBe(true);
    for (const kind of SECTION_KINDS.filter((k) => k !== 'AUDIO')) {
      expect(isSingletonKind(kind), kind).toBe(false);
    }
  });

  it('creates sections with matching props and unique ids', () => {
    for (const kind of SECTION_KINDS) {
      const s = createSection(kind);
      expect(s.kind).toBe(kind);
      expect(s.enabled).toBe(true);
      expect(s.props.kind).toBe(kind);
      expect(createSection(kind).id).not.toBe(s.id);
    }
    expect(getSectionMeta('VIDEO').label.EN).toBe('Video');
  });

  it('localises default text content', () => {
    const es = defaultPropsFor('TEXT', 'ES');
    const en = defaultPropsFor('TEXT', 'EN');
    if (es.kind !== 'TEXT' || en.kind !== 'TEXT') throw new Error('wrong kind');
    expect(es.content).not.toBe(en.content);
  });
});

describe('parseVideoUrl', () => {
  it('recognises YouTube in its many shapes', () => {
    const id = 'dQw4w9WgXcQ';
    for (const url of [
      `https://www.youtube.com/watch?v=${id}`,
      `https://youtube.com/watch?v=${id}&t=30s`,
      `https://youtu.be/${id}`,
      `https://www.youtube.com/embed/${id}`,
      `https://www.youtube.com/shorts/${id}`,
      `https://m.youtube.com/watch?v=${id}`,
    ]) {
      expect(parseVideoUrl(url), url).toEqual({ provider: 'YOUTUBE', src: id });
    }
  });

  it('recognises Vimeo', () => {
    expect(parseVideoUrl('https://vimeo.com/123456789')).toEqual({ provider: 'VIMEO', src: '123456789' });
    expect(parseVideoUrl('https://player.vimeo.com/video/123456789')).toEqual({ provider: 'VIMEO', src: '123456789' });
  });

  it('recognises direct file links, including storage URLs with query strings', () => {
    const direct = 'https://cdn.example.com/clips/toast.mp4';
    expect(parseVideoUrl(direct)).toEqual({ provider: 'FILE', src: direct });
    const storage = 'https://xyz.supabase.co/storage/v1/object/public/invitation-images/uuid-clip.webm?token=abc';
    expect(parseVideoUrl(storage)).toEqual({ provider: 'FILE', src: storage });
  });

  it('rejects anything it cannot play', () => {
    for (const bad of ['', '   ', 'not a url', 'ftp://example.com/a.mp4', 'https://example.com/page', 'https://vimeo.com/channels']) {
      expect(parseVideoUrl(bad), bad).toBeNull();
    }
  });

  it('builds privacy-friendly embed urls', () => {
    expect(videoEmbedUrl('YOUTUBE', 'abc123')).toContain('youtube-nocookie.com/embed/abc123');
    expect(videoEmbedUrl('VIMEO', '99')).toContain('player.vimeo.com/video/99');
    expect(videoEmbedUrl('FILE', 'https://x/y.mp4')).toBe('https://x/y.mp4');
  });

  it('caps uploads at the JSON body limit', () => {
    expect(MAX_VIDEO_BYTES).toBe(7 * 1024 * 1024);
  });
});
