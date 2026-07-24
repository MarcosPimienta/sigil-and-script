// ────────────────────────────────────────────────────────────────────
// Sigil — Client-side Auto-Translation Service
// Translates human custom text inputs (custom quotes, custom registry text,
// custom itinerary titles, text blocks) dynamically for ES and EN guests.
// ────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

const TRANSLATION_CACHE_KEY = 'sigil_translation_cache_v1';

// Synchronous local dictionary for instant zero-latency translations
const STATIC_DICT: Record<string, { EN: string; ES: string }> = {
  'san josé, cuyo poder sabe hacer posibles las cosas imposibles': {
    EN: 'St. Joseph, whose power knows how to make impossible things possible',
    ES: 'San José, cuyo poder sabe hacer posibles las cosas imposibles',
  },
  'lluvia de sobres': {
    EN: 'Gift Envelopes',
    ES: 'Lluvia de Sobres',
  },
  'tu presencia es nuestro mejor regalo, pero si deseas obsequiarnos algo, puedes hacerlo de la siguiente forma:': {
    EN: 'Your presence is our present. Should you wish to honor us with a gift, a contribution towards our registry would be warmly received.',
    ES: 'Tu presencia es nuestro mejor regalo, pero si deseas obsequiarnos algo, puedes hacerlo de la siguiente forma:',
  },
  'su compañía es lo más importante. si desean hacernos un obsequio, lo recibiremos con mucho cariño.': {
    EN: 'Your presence is our present. Should you wish to honor us with a gift, a contribution towards our registry would be warmly received.',
    ES: 'Su compañía es lo más importante. Si desean hacernos un obsequio, lo recibiremos con mucho cariño.',
  },
  'confirmar asistencia': {
    EN: 'RSVP Response',
    ES: 'Confirmar Asistencia',
  },
  'ceremonia religiosa': {
    EN: 'Religious Ceremony',
    ES: 'Ceremonia Religiosa',
  },
  'recepción': {
    EN: 'Reception',
    ES: 'Recepción',
  },
  'recepcion': {
    EN: 'Reception',
    ES: 'Recepción',
  },
  'fiesta': {
    EN: 'Party',
    ES: 'Fiesta',
  },
  'brindis': {
    EN: 'Toast',
    ES: 'Brindis',
  },
  'traje formal': {
    EN: 'Formal Suit',
    ES: 'Traje formal',
  },
  'favor de evitar color azul marino': {
    EN: 'Please avoid navy blue',
    ES: 'Favor de evitar color azul marino',
  },
  'vestido largo': {
    EN: 'Evening Gown',
    ES: 'Vestido largo',
  },
  'favor de evitar colores blanco, beige o colores pasteles': {
    EN: 'Please avoid white, beige, or pastel colors',
    ES: 'Favor de evitar colores blanco, beige o colores pasteles',
  },
};

function getLocalCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
}

const memoryCache: Record<string, string> = getLocalCache();

/**
 * Translates a given text string synchronously (if in dictionary/cache)
 * or asynchronously via free translation fallback.
 */
export async function autoTranslateText(text: string, targetLang: 'ES' | 'EN'): Promise<string> {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Check static dictionary
  if (STATIC_DICT[lower]) {
    return STATIC_DICT[lower][targetLang] || text;
  }

  if (targetLang === 'ES') return text; // Default content is Spanish

  // 2. Check persistent/in-memory cache
  const cacheKey = `es_en:${lower}`;
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  // 3. Fallback: Free MyMemory Translate API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=es|en`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && typeof translated === 'string' && translated !== trimmed) {
      memoryCache[cacheKey] = translated;
      setLocalCache(memoryCache);
      return translated;
    }
  } catch (err) {
    console.warn('Auto-translation fetch failed fallbacking to original text:', err);
  }

  return text;
}

/**
 * Synchronously returns dictionary match or cached translation,
 * otherwise triggers async auto-translation and updates state.
 */
export function useAutoTranslation(text: string, targetLang: 'ES' | 'EN'): string {
  const trimmed = (text || '').trim();
  const lower = trimmed.toLowerCase();

  // Initial sync check
  const staticMatch = STATIC_DICT[lower];
  const initialValue = targetLang === 'ES' 
    ? text 
    : (staticMatch ? staticMatch.EN : (memoryCache[`es_en:${lower}`] || text));

  const [translated, setTranslated] = useState<string>(initialValue);

  useEffect(() => {
    if (targetLang === 'ES' || !text) {
      setTranslated(text);
      return;
    }

    if (STATIC_DICT[lower]) {
      setTranslated(STATIC_DICT[lower].EN);
      return;
    }

    let isMounted = true;
    autoTranslateText(text, targetLang).then((result) => {
      if (isMounted) {
        setTranslated(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, targetLang, lower]);

  return translated;
}
