// ─────────────────────────────────────────────────────────────────────────────
// Sigil — i18n Dictionary & Translation Helper
// Supports English (EN) and Spanish (ES / SPA) invitation section localizations
// ─────────────────────────────────────────────────────────────────────────────

export type Language = 'EN' | 'ES';

export interface TranslationDictionary {
  countdownTitle: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  itineraryTitle: string;
  viewMap: string;
  dressCodeTitle: string;
  registryTitle: string;
  viewRegistry: string;
  rsvpTitle: string;
  willAttend: string;
  yesGladly: string;
  noRegrettably: string;
  mealPreference: string;
  chooseMeal: string;
  beefMeal: string;
  salmonMeal: string;
  vegMeal: string;
  dietaryRestrictions: string;
  dietaryPlaceholder: string;
  plusOneName: string;
  plusOnePlaceholder: string;
  familyGuests: string;
  customNotesPlaceholder: string;
  submitRsvp: string;
  thankYou: string;
  responseRecorded: string;
  attendingStatus: string;
  notAttendingStatus: string;
  mealLabel: string;
  dietaryLabel: string;
  guestLabel: string;
  familyAttendingLabel: string;
  noteLabel: string;
  noneText: string;
}

export const DICTIONARY: Record<Language, TranslationDictionary> = {
  EN: {
    countdownTitle: 'THE CELEBRATION BEGINS IN',
    days: 'DAYS',
    hours: 'HOURS',
    minutes: 'MINUTES',
    seconds: 'SECONDS',
    itineraryTitle: 'EVENT ITINERARY',
    viewMap: 'View Map',
    dressCodeTitle: 'DRESS CODE',
    registryTitle: 'GIFTS REGISTRY',
    viewRegistry: 'View Registry',
    rsvpTitle: 'RSVP Response',
    willAttend: 'Will you attend?',
    yesGladly: 'Yes, gladly',
    noRegrettably: 'No, regrettably',
    mealPreference: 'Meal Preference',
    chooseMeal: 'Choose a meal',
    beefMeal: 'Prime Beef Tenderloin',
    salmonMeal: 'Atlantic Salmon',
    vegMeal: 'Truffle Wild Mushroom Risotto',
    dietaryRestrictions: 'Dietary Restrictions',
    dietaryPlaceholder: 'e.g. Gluten-free, nut allergies',
    plusOneName: 'Plus-One Guest Name',
    plusOnePlaceholder: 'First and last name',
    familyGuests: 'Additional Guests / Family',
    customNotesPlaceholder: 'Type your response...',
    submitRsvp: 'Submit RSVP',
    thankYou: 'Thank You!',
    responseRecorded: 'Your response has been recorded successfully.',
    attendingStatus: 'Attending',
    notAttendingStatus: 'Not Attending',
    mealLabel: 'Meal',
    dietaryLabel: 'Dietary',
    guestLabel: 'Guest',
    familyAttendingLabel: 'Family attending',
    noteLabel: 'Note',
    noneText: 'None',
  },
  ES: {
    countdownTitle: 'LA CELEBRACIÓN COMIENZA EN',
    days: 'DÍAS',
    hours: 'HORAS',
    minutes: 'MINUTOS',
    seconds: 'SEGUNDOS',
    itineraryTitle: 'ITINERARIO DEL EVENTO',
    viewMap: 'Ver Mapa',
    dressCodeTitle: 'CÓDIGO DE VESTIMENTA',
    registryTitle: 'MESA DE REGALOS',
    viewRegistry: 'Ver Mesa de Regalos',
    rsvpTitle: 'Confirmación de Asistencia',
    willAttend: '¿Asistirás?',
    yesGladly: 'Sí, con gusto',
    noRegrettably: 'No, lamentablemente',
    mealPreference: 'Preferencia de Menú',
    chooseMeal: 'Elige un menú',
    beefMeal: 'Lomo de Res a la Parrilla',
    salmonMeal: 'Salmón del Atlántico',
    vegMeal: 'Risotto de Hongos Silvestres',
    dietaryRestrictions: 'Restricciones Alimentarias',
    dietaryPlaceholder: 'Ej: Celíaco, alergia a frutos secos',
    plusOneName: 'Nombre del Acompañante',
    plusOnePlaceholder: 'Nombre y apellido',
    familyGuests: 'Invitados Adicionales / Familia',
    customNotesPlaceholder: 'Escribe tu respuesta...',
    submitRsvp: 'Enviar Confirmación',
    thankYou: '¡Muchas Gracias!',
    responseRecorded: 'Tu respuesta ha sido registrada exitosamente.',
    attendingStatus: 'Asistirá',
    notAttendingStatus: 'No asistirá',
    mealLabel: 'Menú',
    dietaryLabel: 'Restricciones',
    guestLabel: 'Acompañante',
    familyAttendingLabel: 'Familia que asiste',
    noteLabel: 'Nota',
    noneText: 'Ninguno',
  },
};

export function getTranslation(lang?: Language): TranslationDictionary {
  if (lang === 'EN') return DICTIONARY.EN;
  return DICTIONARY.ES; // Default to Spanish (ES)
}
