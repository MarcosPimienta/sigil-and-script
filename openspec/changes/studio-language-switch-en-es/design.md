# Technical Design: Studio Language Switch (English / Spanish)

## Architectural Decisions

### Decision 1: `InvitationDesign` Language Schema Property
- **Choice**: Store `language: 'EN' | 'ES'` on the `InvitationDesign` model.
- **Reasoning**: Ensures the host's language preference is persisted to the backend database along with the rest of the canvas design (`designData`) and remains consistent when recipients view the invitation or hosts load saved designs across devices.

### Decision 2: Centralized Dictionary Lookup (`src/utils/i18n.ts`)
- **Choice**: Implement a lightweight dictionary object:
  ```typescript
  export type Language = 'EN' | 'ES';

  export const DICTIONARY = {
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
      dietaryRestrictions: 'Dietary Restrictions',
      plusOneName: 'Plus-One Guest Name',
      familyGuests: 'Additional Guests / Family',
      submitRsvp: 'Submit RSVP',
      thankYou: 'Thank You!',
      responseRecorded: 'Your response has been recorded successfully.',
      attending: 'Attending',
      notAttending: 'Not Attending',
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
      dietaryRestrictions: 'Restricciones Alimentarias',
      plusOneName: 'Nombre del Acompañante',
      familyGuests: 'Invitados Adicionales / Familia',
      submitRsvp: 'Enviar Confirmación',
      thankYou: '¡Muchas Gracias!',
      responseRecorded: 'Tu respuesta ha sido registrada exitosamente.',
      attending: 'Asistirá',
      notAttending: 'No asistirá',
    },
  } as const;

  export function getTranslation(lang: Language = 'ES') {
    return DICTIONARY[lang] || DICTIONARY.ES;
  }
  ```

### Decision 3: Segmented Toggle UI (`[ EN | SPA ]`)
- **Choice**: Render a compact segmented button control in `Toolbar.tsx` and `SectionEditor.tsx`:
  - Active button highlighted with accent styling.
  - Toggling dispatches `updateDesign({ language: 'EN' | 'ES' })`.

## Risks & Mitigations
- **Missing Language Fallback**: If `design.language` is undefined or unrecognized, default gracefully to `'ES'`.
- **User Custom Text Preservation**: Ensure freeform host inputs (e.g., custom itinerary titles or host names) are not overwritten when toggling language; only section framework titles adapt.
