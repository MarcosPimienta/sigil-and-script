// BIRTHDAY — also quinceañera / sweet sixteen by editing the copy.
import type { EventTemplate } from './base';
import { baseDesign, itin, section } from './base';

export const birthdayTemplate: EventTemplate = {
  id: 'BIRTHDAY',
  createDesign: (lang) => {
    const es = lang === 'ES';
    const d = baseDesign('BIRTHDAY', lang, es ? 'Sofía' : 'Sofía');
    d.itinerary = [
      itin('itin-1', 'PARTY', es ? 'Fiesta' : 'Party', es ? 'Salón de eventos, Calle Principal 123' : 'Event hall, 123 Main Street', '19:00'),
      itin('itin-2', 'DINNER', es ? 'Cena' : 'Dinner', es ? 'Mismo lugar' : 'Same venue', '21:00'),
    ];
    d.dressCode = {
      intro: es ? 'Elegante casual' : 'Smart casual',
      groups: [
        {
          id: 'dc-guests',
          label: es ? 'Invitados' : 'Guests',
          text: es ? 'Elegante casual' : 'Smart casual',
          subtext: es ? 'Ven con ganas de bailar' : 'Come ready to dance',
          icon: 'sparkle',
        },
      ],
    };
    d.registryText = es
      ? 'Tu presencia es el mejor regalo. Si quieres darme algo, aquí está mi lista de deseos.'
      : 'Your presence is the best gift. If you would like to give something, here is my wishlist.';
    d.rsvpFormConfig = { ...d.rsvpFormConfig!, allowPlusOnes: true };
    d.sections = [
      section('AUDIO'), section('COUNTDOWN'), section('ITINERARY'),
      section('DRESS_CODE'), section('GIFTS'), section('RSVP'),
    ];
    return d;
  },
};
