// CUSTOM — neutral starting point: headline, countdown, programme, RSVP.
import type { EventTemplate } from './base';
import { baseDesign, itin, section } from './base';

export const customTemplate: EventTemplate = {
  id: 'CUSTOM',
  createDesign: (lang) => {
    const es = lang === 'ES';
    const d = baseDesign('CUSTOM', lang, es ? 'Nuestro Evento' : 'Our Event');
    d.itinerary = [
      itin('itin-1', 'ACTIVITY', es ? 'Evento' : 'Event', es ? 'Dirección o lugar' : 'Address or venue', '18:00'),
    ];
    d.sections = [section('COUNTDOWN'), section('ITINERARY'), section('RSVP')];
    return d;
  },
};
