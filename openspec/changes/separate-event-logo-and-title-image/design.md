# Technical Design: Separate Event Logo vs Event Title Image

## Architectural Decisions

1. **Property Mapping**:
   - **`openedEnvelopeImage` & `openedEnvelopeImageScale`**: Top monogram/logo displayed on the envelope flap. Controlled via `LeftPanel.tsx` -> "Custom Artwork" -> `Logo del Evento / Monograma`.
   - **`headerImage` & `headerImageScale`**: Main Title Image (custom calligraphy or emblem) displayed on the parchment paper card. Controlled via `SectionEditor.tsx` -> `Título del Evento`.

2. **Stage Layout Integration**:
   - In `InvitationStage.tsx`, inside `.stage-content`, before the text blocks:
     ```tsx
     {design.headerImage && (
       <div style={{
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
         width: '100%',
         marginBottom: '1rem',
       }}>
         <img 
           src={design.headerImage} 
           alt="Event Title Artwork"
           style={{
             maxWidth: `${Math.round(280 * ((design.headerImageScale ?? 100) / 100))}px`,
             maxHeight: `${Math.round(200 * ((design.headerImageScale ?? 100) / 100))}px`,
             objectFit: 'contain',
             display: 'block',
             margin: '0 auto',
           }}
         />
       </div>
     )}
     ```
   - Creators can use text title, image title, or both!

## Risks & Mitigations
- Backward Compatibility: Existing canvas designs without `headerImageScale` default to `100%`.
