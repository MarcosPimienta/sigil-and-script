// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Event template registry
// Adding an event type = one template file + one entry here (+ phrasing JSON).
// ─────────────────────────────────────────────────────────────────────────────
import type { EventType, InvitationDesign } from '../types/sigil.types';
import type { EventTemplate, TemplateLang } from './base';
import { weddingTemplate } from './wedding';
import { birthdayTemplate } from './birthday';
import { baptismTemplate } from './baptism';
import { corporateTemplate } from './corporate';
import { customTemplate } from './custom';

export type { EventTemplate, TemplateLang } from './base';

export const EVENT_TEMPLATES: Record<EventType, EventTemplate> = {
  WEDDING: weddingTemplate,
  BIRTHDAY: birthdayTemplate,
  BAPTISM: baptismTemplate,
  CORPORATE: corporateTemplate,
  CUSTOM: customTemplate,
};

export const EVENT_TEMPLATE_ORDER: EventType[] = ['WEDDING', 'BIRTHDAY', 'BAPTISM', 'CORPORATE', 'CUSTOM'];

export function getTemplate(type: EventType | undefined): EventTemplate {
  return (type && EVENT_TEMPLATES[type]) || EVENT_TEMPLATES.WEDDING;
}

export function createDesignFromTemplate(type: EventType, lang: TemplateLang = 'ES'): InvitationDesign {
  return getTemplate(type).createDesign(lang);
}
