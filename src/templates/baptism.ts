// BAPTISM — also first communion / confirmation by editing the copy.
import type { EventTemplate } from './base';
import { baseDesign, itin, section } from './base';

export const baptismTemplate: EventTemplate = {
  id: 'BAPTISM',
  createDesign: (lang) => {
    const es = lang === 'ES';
    const d = baseDesign('BAPTISM', lang, 'Mateo');
    d.itinerary = [
      itin('itin-1', 'CEREMONY', es ? 'Ceremonia' : 'Ceremony', es ? 'Parroquia San Juan, Calle 5 #10' : 'St. John Parish, 10 Fifth Street', '11:00'),
      itin('itin-2', 'RECEPTION', es ? 'Recepción' : 'Reception', es ? 'Casa de la familia' : 'Family home', '13:00'),
    ];
    d.dressCode = {
      intro: 'Formal',
      groups: [
        { id: 'dc-guests', label: es ? 'Invitados' : 'Guests', text: 'Formal', icon: 'dove' },
      ],
    };
    d.registryText = es
      ? 'Su compañía es lo más importante. Si desean hacer un obsequio, lo recibiremos con cariño.'
      : 'Your presence means the most. Should you wish to give a gift, it will be warmly received.';
    d.sections = [
      section('AUDIO'), section('COUNTDOWN'),
      section('TEXT', true, {
        id: 'sec-godparents',
        title: es ? 'Padrinos' : 'Godparents',
        props: {
          kind: 'TEXT',
          content: es ? 'Padrinos: Ana Gómez y Luis Pérez' : 'Godparents: Ana Gómez & Luis Pérez',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 1.2,
          fontStyle: 'italic',
          color: 'DARK_INK',
          textAlign: 'center',
        },
      }),
      section('ITINERARY'), section('DRESS_CODE'), section('GIFTS'), section('RSVP'),
    ];
    return d;
  },
};
