# Technical Design: Event Title Text/Image & Image Scaling Slider

## Architectural Decisions
1. **Field Labeling & Internationalization**:
   - Change label in `SectionEditor.tsx` from `Nombres de los Novios (Host Names)` to `Título del Evento (Event Title)`.
   - Update placeholder from `Ej: Oscar & Rocio` to `Ej: Oscar & Rocio / Nuestra Boda`.

2. **Dual Text/Image Support in Section Editor**:
   - Keep the existing `tb-headline` text block update logic for text-based event titles.
   - Add an `ImageUploadSlot` directly within `SectionEditor.tsx` under the Event Title section for `openedEnvelopeImage` (the Event Title Logo/Image).
   - This gives creators full flexibility to use text, image, or both.

3. **Image Scaling Slider**:
   - Store property: `openedEnvelopeImageScale?: number` (default 100).
   - Slider range: `20%` to `200%`.
   - Render scaling calculation in `EnvelopeWrapper.tsx`:
     - Base `maxWidth`: `220px` at 100% scale.
     - Base `maxHeight`: `280px` at 100% scale.
     - Dynamic style:
       `maxWidth: Math.round(220 * ((openedEnvelopeImageScale ?? 100) / 100)) + 'px'`,
       `maxHeight: Math.round(280 * ((openedEnvelopeImageScale ?? 100) / 100)) + 'px'`.

## Risks & Mitigations
- Backward compatibility: If `openedEnvelopeImageScale` is undefined on existing saved canvas data, fallback to `100%` (`openedEnvelopeImageScale ?? 100`).
