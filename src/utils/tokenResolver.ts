// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Guest Token Resolver
// utils/tokenResolver.ts
//
// Hydrates an invitation template string containing {{tokens}} with a
// GuestPayload object.
//
// Security notes:
//   - Token values are strings only. They are inserted into React components
//     via textContent-equivalent JSX rendering, NEVER via innerHTML.
//     See XSS note in SigilContext.tsx.
//   - Input validation: token keys are resolved against a strict allow-list;
//     unknown token keys are replaced with an empty string (fail-safe).
//   - TODO(security): If guest payloads ever originate from a backend API,
//     validate and sanitize them server-side before sending to the client.
// ─────────────────────────────────────────────────────────────────────────────

import type { GuestPayload } from '../types/sigil.types';

// ── Token Allow-List ──────────────────────────────────────────────────────────

/**
 * Exhaustive mapping of template token keys to GuestPayload fields.
 * Only keys present in this map are ever resolved. Unknown tokens are
 * replaced with an empty string to prevent information leakage.
 */
type TokenKey =
  | 'guest_name'
  | 'additional_guests'
  | 'rsvp_by'
  | 'event_date'
  | 'event_location';

const ALLOWED_TOKENS: readonly TokenKey[] = [
  'guest_name',
  'additional_guests',
  'rsvp_by',
  'event_date',
  'event_location',
] as const;

// ── Token → Value Resolver ────────────────────────────────────────────────────

function resolveToken(key: TokenKey, guest: GuestPayload): string {
  switch (key) {
    case 'guest_name':
      return sanitizeTokenValue(guest.guestName);

    case 'additional_guests':
      if (!guest.additionalGuests || guest.additionalGuests.length === 0) {
        return '';
      }
      return guest.additionalGuests.map(sanitizeTokenValue).join(', ');

    case 'rsvp_by':
      return sanitizeTokenValue(guest.rsvpBy ?? '');

    case 'event_date':
      return sanitizeTokenValue(guest.eventDate ?? '');

    case 'event_location':
      return sanitizeTokenValue(guest.eventLocation ?? '');

    default: {
      // Exhaustive check — TypeScript ensures this is unreachable
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

// ── Sanitisation ──────────────────────────────────────────────────────────────

/**
 * Strips control characters and trims the token value.
 * This is a lightweight defence-in-depth layer; the primary XSS defence
 * is React's JSX rendering (textContent-equivalent), NOT this function.
 *
 * Allows: printable Unicode, spaces, punctuation.
 * Strips: ASCII control characters (U+0000–U+001F, U+007F).
 */
function sanitizeTokenValue(value: string | { name: string; included?: boolean }): string {
  const str = typeof value === 'string' ? value : value?.name || '';
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Hydrates a template string by replacing all `{{token_key}}` placeholders
 * with the corresponding value from the provided GuestPayload.
 *
 * - Only token keys in the ALLOWED_TOKENS list are resolved.
 * - Unknown tokens are replaced with an empty string.
 * - Malformed / unclosed tokens (e.g. `{{foo`) are left unchanged.
 *
 * @example
 * resolveTokens('Dear {{guest_name}},', { guestName: 'The Smiths', ... })
 * // → 'Dear The Smiths,'
 */
export function resolveTokens(template: string, guest: GuestPayload): string {
  // Matches {{token_key}} — word chars and underscores only inside braces
  const TOKEN_PATTERN = /\{\{([a-z_]+)\}\}/g;

  return template.replace(TOKEN_PATTERN, (_match, rawKey: string) => {
    // Validate the key against the allow-list
    if (!(ALLOWED_TOKENS as readonly string[]).includes(rawKey)) {
      // Unknown token — silently replace with empty string (fail-safe)
      return '';
    }
    return resolveToken(rawKey as TokenKey, guest);
  });
}

/**
 * Resolves all token strings in an array of text values.
 * Useful for resolving all TextBlock.content fields in one pass.
 */
export function resolveAllTextBlocks(
  contents: string[],
  guest: GuestPayload,
): string[] {
  return contents.map((content) => resolveTokens(content, guest));
}

/**
 * Returns the full name label for a guest, including additional guests
 * formatted with proper conjunction grammar:
 *
 * - 0 additional:  "Alice"
 * - 1 additional:  "Alice & Bob"
 * - 2+ additional: "Alice, Bob & Carol"
 */
export function formatGuestDisplayName(guest: GuestPayload): string {
  const primary = sanitizeTokenValue(guest.guestName);
  const additional = (guest.additionalGuests ?? []).map(sanitizeTokenValue);

  if (additional.length === 0) return primary;

  const allNames = [primary, ...additional];
  const last = allNames.pop()!;
  return allNames.length > 0
    ? `${allNames.join(', ')} & ${last}`
    : `${primary} & ${last}`;
}
