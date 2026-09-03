// Icon lookups shared by renderers, editors and templates (kept out of
// eventIcons.tsx so that file only exports components — React Fast Refresh).
import type { EventType, IconId, ItineraryKind } from '../../types/sigil.types';

export const ICON_IDS: IconId[] = [
  'church', 'rings', 'toast', 'cake', 'balloon', 'gift', 'dinner', 'podium', 'briefcase',
  'dove', 'candle', 'music', 'pin', 'suit', 'dress', 'tie', 'badge', 'sparkle',
  'play', 'eye', 'eyeOff', 'trash', 'plus',
];

export const ITINERARY_KIND_ICON: Record<ItineraryKind, IconId> = {
  CEREMONY: 'church',
  RECEPTION: 'toast',
  PARTY: 'balloon',
  DINNER: 'dinner',
  TALK: 'podium',
  ACTIVITY: 'sparkle',
  CUSTOM: 'pin',
};

export const EVENT_TYPE_ICON: Record<EventType, IconId> = {
  WEDDING: 'rings',
  BIRTHDAY: 'cake',
  BAPTISM: 'dove',
  CORPORATE: 'briefcase',
  CUSTOM: 'sparkle',
};

export const ITINERARY_KIND_LABEL: Record<ItineraryKind, { ES: string; EN: string }> = {
  CEREMONY: { ES: 'Ceremonia', EN: 'Ceremony' },
  RECEPTION: { ES: 'Recepción', EN: 'Reception' },
  PARTY: { ES: 'Fiesta', EN: 'Party' },
  DINNER: { ES: 'Cena', EN: 'Dinner' },
  TALK: { ES: 'Charla', EN: 'Talk' },
  ACTIVITY: { ES: 'Actividad', EN: 'Activity' },
  CUSTOM: { ES: 'Otro', EN: 'Other' },
};

