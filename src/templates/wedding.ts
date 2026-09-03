// WEDDING — reproduces the original default design field for field (ES), plus EN.
import type { EventTemplate } from './base';
import { baseDesign, itin, section } from './base';

export const weddingTemplate: EventTemplate = {
  id: 'WEDDING',
  createDesign: (lang) => {
    const es = lang === 'ES';
    const d = baseDesign('WEDDING', lang, 'Oscar & Rocio');
    // Keep the historical fixed date for ES so legacy parity holds exactly.
    d.countdownTarget = '2026-09-17T18:00:00';
    d.itinerary = [
      itin('itin-1', 'CEREMONY', es ? 'Ceremonia Religiosa' : 'Religious Ceremony',
        'Parroquia Nuestra Señora de Aránzazu, Constitución 950, San Fernando', '18:00'),
      itin('itin-2', 'RECEPTION', es ? 'Recepción' : 'Reception', 'Palacio Sans Souci, Paz 705', '19:00'),
    ];
    d.dressCode = {
      intro: 'Formal',
      groups: [
        {
          id: 'dc-male',
          label: es ? 'Ellos' : 'Gentlemen',
          text: es ? 'Traje formal' : 'Formal Suit',
          subtext: es ? 'Favor de evitar color azul marino' : 'Please avoid navy blue',
          avoidColors: ['#003366'],
          icon: 'suit',
        },
        {
          id: 'dc-female',
          label: es ? 'Ellas' : 'Ladies',
          text: es ? 'Vestido largo' : 'Evening Gown',
          subtext: es ? 'Favor de evitar colores blanco, beige o colores pasteles' : 'Please avoid white, beige, or pastel colors',
          avoidColors: ['#ffffff', '#f5f5dc', '#ffd1dc'],
          icon: 'dress',
        },
      ],
    };
    d.registryText = es
      ? 'Su compañía es lo más importante. Si desean hacernos un obsequio, lo recibiremos con mucho cariño.'
      : 'Your presence is our present. Should you wish to honor us with a gift, a contribution towards our registry would be warmly received.';
    d.sections = [
      section('AUDIO'), section('COUNTDOWN'), section('ITINERARY'),
      section('DRESS_CODE'), section('GIFTS'), section('RSVP'),
    ];
    return d;
  },
};
