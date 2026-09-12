// ─────────────────────────────────────────────────────────────────────────────
// One string table for the whole left panel.
//
// The panel used to mix Spanish and English in the same view ("Custom Artwork"
// above "Textura de Fondo"), because every component carried its own
// `t(es, en)` helper and an untranslated English literal was never an error.
// Here a missing translation is a type error instead.
// ─────────────────────────────────────────────────────────────────────────────

import { useSigilStore } from '../../../state/sigilStore';

export type PanelLang = 'ES' | 'EN';

interface Phrase {
  ES: string;
  EN: string;
}

export const PANEL_STRINGS = {
  // ── Tabs ───────────────────────────────────────────────────────────────────
  tabEvent: { ES: 'Evento', EN: 'Event' },
  tabSections: { ES: 'Secciones', EN: 'Sections' },
  tabStyle: { ES: 'Estilo', EN: 'Style' },

  // ── Event tab ──────────────────────────────────────────────────────────────
  eventTypeGroup: { ES: 'Tipo de evento', EN: 'Event type' },
  eventTypeHint: {
    ES: 'Cambia el vocabulario y las secciones sugeridas. Tu contenido no se pierde.',
    EN: 'Changes the wording and the suggested sections. Your content is kept.',
  },
  eventDetailsGroup: { ES: 'Datos del evento', EN: 'Event details' },
  eventTitleLabel: { ES: 'Título de la invitación', EN: 'Invitation title' },
  dateTimeLabel: { ES: 'Fecha y hora', EN: 'Date and time' },
  venueLabel: { ES: 'Lugar', EN: 'Venue' },
  rsvpByLabel: { ES: 'Confirmar antes del', EN: 'RSVP by' },
  rsvpByPlaceholder: { ES: 'Ej: 31 de enero', EN: 'e.g. January 31st' },
  venuePlaceholder: { ES: 'Ej: Hacienda San Rafael', EN: 'e.g. San Rafael Estate' },
  venueHint: {
    ES: 'El lugar real de cada momento se define en la sección Itinerario.',
    EN: 'The real venue for each moment is set in the Itinerary section.',
  },
  rsvpByHint: {
    ES: 'Se guarda con la invitación y es lo que ven tus invitados.',
    EN: 'Saved with the invitation — this is what your guests see.',
  },
  dateTimeHint: {
    ES: 'Alimenta la cuenta regresiva y la fecha que ven tus invitados.',
    EN: 'Drives the countdown and the date your guests see.',
  },
  languageGroup: { ES: 'Idioma', EN: 'Language' },
  languageEs: { ES: 'Español', EN: 'Spanish' },
  languageEn: { ES: 'Inglés', EN: 'English' },
  previewGroup: { ES: 'Vista previa', EN: 'Preview' },
  previewGuestLabel: { ES: 'Ver la invitación como', EN: 'View the invitation as' },
  previewGuestPlaceholder: { ES: 'Ej: Familia Morales', EN: 'e.g. The Morales Family' },
  previewHint: {
    ES: 'Sólo afecta lo que ves aquí — no cambia la invitación.',
    EN: 'Only affects what you see here — it does not change the invitation.',
  },

  // ── Sections tab ───────────────────────────────────────────────────────────
  addSection: { ES: 'Agregar', EN: 'Add' },
  sectionsWord: { ES: 'secciones', EN: 'sections' },
  visibleWord: { ES: 'visibles', EN: 'visible' },
  sectionsEmpty: { ES: 'Sin secciones todavía.', EN: 'No sections yet.' },
  sectionsHint: {
    ES: 'Arrastra para reordenar · clic para editar · doble clic para renombrar',
    EN: 'Drag to reorder · click to edit · double-click to rename',
  },
  paletteTitle: { ES: 'Agregar una sección', EN: 'Add a section' },
  paletteHint: {
    ES: 'Se añade al final y puedes moverla donde quieras.',
    EN: 'It is added at the end and you can move it anywhere.',
  },
  paletteSearch: { ES: 'Buscar tipo de sección', EN: 'Search section types' },
  paletteNoMatch: { ES: 'Ningún tipo coincide.', EN: 'No section type matches.' },
  paletteAlreadyAdded: { ES: 'ya agregada', EN: 'already added' },
  paletteOnlyOne: {
    ES: 'Ya existe — solo se permite una',
    EN: 'Already added — only one allowed',
  },
  warnRsvpMany: {
    ES: 'Hay más de un formulario de confirmación: tus invitados verán dos.',
    EN: 'More than one RSVP form is enabled — guests will see two.',
  },
  warnRsvpNone: {
    ES: 'No hay formulario de confirmación visible. Tus invitados no podrán responder.',
    EN: 'No RSVP form is visible — guests will not be able to reply.',
  },
  rowHide: { ES: 'Ocultar', EN: 'Hide' },
  rowShow: { ES: 'Mostrar', EN: 'Show' },
  rowMoveUp: { ES: 'Subir', EN: 'Move up' },
  rowMoveDown: { ES: 'Bajar', EN: 'Move down' },
  rowDrag: { ES: 'Arrastrar para reordenar', EN: 'Drag to reorder' },
  rowOpen: { ES: 'Editar esta sección', EN: 'Edit this section' },
  rowRenameLabel: { ES: 'Nombre de la sección', EN: 'Section name' },
  rowHiddenBadge: { ES: 'Oculta', EN: 'Hidden' },

  // ── Section inspector ──────────────────────────────────────────────────────
  inspectorBack: { ES: 'Secciones', EN: 'Sections' },
  inspectorContent: { ES: 'Contenido', EN: 'Content' },
  inspectorType: { ES: 'Tipografía', EN: 'Typography' },
  inspectorTitleLabel: { ES: 'Título de la sección', EN: 'Section heading' },
  inspectorNameLabel: { ES: 'Nombre en la lista', EN: 'Name in the list' },
  inspectorNameHint: {
    ES: 'Sólo para encontrarla en el panel — esta sección no muestra un título.',
    EN: 'Only for finding it in the panel — this section shows no heading.',
  },
  inspectorVisible: { ES: 'Visible', EN: 'Visible' },
  inspectorHidden: { ES: 'Oculta', EN: 'Hidden' },
  inspectorDelete: { ES: 'Eliminar sección', EN: 'Delete section' },
  inspectorDeleteConfirm: {
    ES: '¿Eliminar esta sección? Su contenido se pierde.',
    EN: 'Delete this section? Its content is lost.',
  },
  inspectorSingleton: { ES: 'Solo se permite una', EN: 'Only one allowed' },
  inspectorNoFields: {
    ES: 'Esta sección no tiene ajustes propios — su tipografía y su título se cambian aquí.',
    EN: 'This section has no settings of its own — its typography and heading are set here.',
  },

  // ── Gifts section ──────────────────────────────────────────────────────────
  giftsTitleLabel: { ES: 'Título de regalos', EN: 'Registry heading' },
  giftsTextLabel: { ES: 'Mensaje', EN: 'Message' },
  giftsSymbolLabel: { ES: 'Símbolo o adorno', EN: 'Symbol or ornament' },
  giftsLinkLabel: { ES: 'Enlace a la lista de regalos', EN: 'Registry link' },
  giftsImageLabel: { ES: 'Imagen de regalos', EN: 'Registry image' },
  giftsImageHint: {
    ES: 'SVG o PNG mostrado debajo del texto',
    EN: 'SVG or PNG shown below the text',
  },
  giftsImageScale: { ES: 'Escala de la imagen', EN: 'Image scale' },

  // ── Itinerary section ──────────────────────────────────────────────────────
  itineraryItems: { ES: 'Momentos', EN: 'Moments' },
  itineraryAdd: { ES: 'Agregar momento', EN: 'Add moment' },
  itineraryEmpty: { ES: 'Sin momentos todavía.', EN: 'No moments yet.' },
  itineraryKind: { ES: 'Tipo', EN: 'Kind' },
  itineraryTitlePlaceholder: { ES: 'Título (Ej: Ceremonia)', EN: 'Title (e.g. Ceremony)' },
  itineraryTimePlaceholder: { ES: 'Hora (Ej: 18:00)', EN: 'Time (e.g. 6:00 pm)' },
  itineraryVenuePlaceholder: { ES: 'Ubicación o dirección', EN: 'Venue or address' },
  itineraryMapPlaceholder: { ES: 'Enlace de mapa (opcional)', EN: 'Map link (optional)' },

  // ── Music section ──────────────────────────────────────────────────────────
  musicLabel: { ES: 'Canción de fondo', EN: 'Background song' },
  musicHint: { ES: 'Sube un archivo MP3, WAV o M4A', EN: 'Upload an MP3, WAV or M4A file' },
  musicUploading: { ES: 'Subiendo audio...', EN: 'Uploading audio...' },
  musicLocalFile: { ES: 'Archivo de audio local', EN: 'Local audio file' },
  musicOnlyOne: {
    ES: 'Solo se permite una sección de música, para que nunca suenen dos canciones a la vez.',
    EN: 'Only one music section is allowed, so two songs can never play at once.',
  },
  musicBadType: {
    ES: 'Formato no admitido. Sube un MP3, WAV o M4A.',
    EN: 'Unsupported file type. Please upload an MP3, WAV or M4A file.',
  },
  musicTooBig: {
    ES: 'El archivo supera el límite de 3 MB. Sube una versión más comprimida.',
    EN: 'The file is over the 3 MB limit. Please upload a smaller or more compressed file.',
  },

  // ── Style tab ──────────────────────────────────────────────────────────────
  styleTypographyGroup: { ES: 'Tipografía predeterminada', EN: 'Default typography' },
  styleTypographyHint: {
    ES: 'Cada sección puede sobrescribir esto desde su propia pestaña de Tipografía.',
    EN: 'Any section can override this from its own Typography tab.',
  },
  styleHeadingFont: { ES: 'Títulos', EN: 'Headings' },
  styleBodyFont: { ES: 'Texto', EN: 'Body text' },
  styleEnvelopeGroup: { ES: 'Sobre y sello', EN: 'Envelope and seal' },
  styleEnvelopeLogo: { ES: 'Logo o monograma del sobre', EN: 'Envelope logo or monogram' },
  styleEnvelopeLogoHint: {
    ES: 'Se muestra en la solapa de apertura del sobre',
    EN: 'Shown on the envelope’s opening flap',
  },
  styleLogoScale: { ES: 'Escala del logo', EN: 'Logo scale' },
  styleSealCreate: { ES: 'Crear o editar el sello', EN: 'Create or edit the seal' },
  styleSealImage: { ES: 'Sello o sticker', EN: 'Seal or sticker' },
  styleSealImageHint: {
    ES: 'Imagen PNG que mantiene la invitación cerrada',
    EN: 'PNG image that keeps the invitation sealed',
  },
  styleSealSize: { ES: 'Tamaño del sello', EN: 'Seal size' },
  stylePaperGroup: { ES: 'Papel y textura', EN: 'Paper and texture' },
  stylePaperImage: { ES: 'Textura del papel', EN: 'Paper texture' },
  stylePaperImageHint: {
    ES: 'Sube una textura sin costuras (JPG o PNG)',
    EN: 'Upload a seamless texture (JPG or PNG)',
  },
  stylePaperBrightness: { ES: 'Brillo', EN: 'Brightness' },
  stylePaperContrast: { ES: 'Contraste', EN: 'Contrast' },
  stylePaperSaturate: { ES: 'Saturación', EN: 'Saturation' },
  styleFrameGroup: { ES: 'Marco y título', EN: 'Frame and title' },
  styleFrameImage: { ES: 'Marco decorativo', EN: 'Decorative frame' },
  styleFrameImageHint: {
    ES: 'Reemplaza el borde procedural cuando está puesto',
    EN: 'Replaces the procedural border when set',
  },
  styleTitleImage: { ES: 'Imagen del título', EN: 'Title image' },
  styleTitleImageHint: {
    ES: 'Una caligrafía o logo para el título principal',
    EN: 'A calligraphy or logo for the main title',
  },
  styleTitleImageScale: { ES: 'Escala del título', EN: 'Title scale' },
  styleGlobalHint: {
    ES: 'Todo lo de aquí afecta a la invitación entera. Lo que pertenece a una sola sección vive dentro de esa sección.',
    EN: 'Everything here affects the whole invitation. Anything belonging to one section lives inside that section.',
  },

  // ── Shared ─────────────────────────────────────────────────────────────────
  none: { ES: 'Sin definir', EN: 'Not set' },
  remove: { ES: 'Quitar', EN: 'Remove' },
  uploading: { ES: 'Subiendo imagen...', EN: 'Uploading image...' },
  defaultOption: { ES: 'Predeterminada', EN: 'Default' },
} satisfies Record<string, Phrase>;

export type PanelStringKey = keyof typeof PANEL_STRINGS;

export function panelText(key: PanelStringKey, lang: PanelLang): string {
  return PANEL_STRINGS[key][lang];
}

/** `t('tabEvent')` in the invitation's own language. */
export function usePanelStrings(): { t: (key: PanelStringKey) => string; lang: PanelLang } {
  const language = useSigilStore((s) => s.design.language);
  const lang: PanelLang = language === 'EN' ? 'EN' : 'ES';
  return { t: (key) => PANEL_STRINGS[key][lang], lang };
}
