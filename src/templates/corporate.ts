// CORPORATE — conference, gala or launch. Agenda-style itinerary, no gifts.
import type { EventTemplate } from './base';
import { baseDesign, itin, section } from './base';

export const corporateTemplate: EventTemplate = {
  id: 'CORPORATE',
  createDesign: (lang) => {
    const es = lang === 'ES';
    const d = baseDesign('CORPORATE', lang, es ? 'Gala Anual 2027' : 'Annual Gala 2027');
    d.textBlocks[0].fontStyle = 'normal';
    d.itinerary = [
      itin('itin-1', 'TALK', es ? 'Bienvenida' : 'Welcome', es ? 'Auditorio principal' : 'Main auditorium', '18:00'),
      itin('itin-2', 'TALK', es ? 'Conferencia' : 'Keynote', es ? 'Auditorio principal' : 'Main auditorium', '18:30'),
      itin('itin-3', 'DINNER', es ? 'Cena de gala' : 'Gala dinner', es ? 'Salón Imperial' : 'Imperial Hall', '20:00'),
    ];
    d.dressCode = {
      intro: es ? 'Formal de negocios' : 'Business formal',
      groups: [
        { id: 'dc-attendees', label: es ? 'Asistentes' : 'Attendees', text: es ? 'Formal de negocios' : 'Business formal', icon: 'badge' },
      ],
    };
    d.rsvpFormConfig = {
      requireMealPreference: true,
      requireDietaryRestrictions: true,
      allowPlusOnes: false,
      customNotesLabel: null,
      mealOptions: es ? ['Carne', 'Pescado', 'Vegetariano'] : ['Meat', 'Fish', 'Vegetarian'],
    };
    d.sections = [
      section('COUNTDOWN'),
      section('TEXT', true, {
        id: 'sec-about',
        title: es ? 'Acerca del evento' : 'About the event',
        props: {
          kind: 'TEXT',
          content: es
            ? 'Acompáñanos a celebrar un año de logros junto a todo el equipo.'
            : 'Join us to celebrate a year of achievements with the whole team.',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 1.1,
          fontStyle: 'normal',
          color: 'DARK_INK',
          textAlign: 'center',
        },
      }),
      section('ITINERARY'), section('DRESS_CODE'), section('RSVP'),
    ];
    return d;
  },
};
