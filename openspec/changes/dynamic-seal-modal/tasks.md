# Tasks — Inline Seal & Sticker Creator (Left Panel)

- [x] 1. Create `SealCreator.tsx` Component
  - [x] 1.1 Stacked layout for the left sidebar with preview canvas at top and controls below
  - [x] 1.2 Image file uploader slot inside the component for mask upload
  - [x] 1.3 Controls for Seal Type ('WAX_SEAL' | 'STICKER'), Seal Color, Bevel Depth, and Finish ('MATTE' | 'METALLIC')
  - [x] 1.4 Canvas 2D rendering pipeline for generating organic wax base, bevel/emboss highlights, and sticker borders
  - [x] 1.5 Debounced canvas redraw trigger on parameter changes
  - [x] 1.6 Export button ("Apply") to turn canvas to PNG, upload via `apiFetch('/upload/media')`, and call `updateDesign({ stickerImage })`

- [x] 2. Update `LeftPanel.tsx`
  - [x] 2.1 Replace the simple sticker upload input with the new `SealCreator` component in the Custom Artwork section
  - [x] 2.2 Manage state to expand/collapse the creator if necessary

- [x] 3. Add Component & Canvas Styles in `creator.css`
  - [x] 3.1 Styling for inline controls matching Sigil dark theme
  - [x] 3.2 Canvas preview container styling with checkerboard transparency background, scaled to fit sidebar

- [x] 4. Manual Verification & Testing
  - [x] 4.1 Test uploading a PNG monogram and generating a red wax seal with Bevel & Emboss in the sidebar
  - [x] 4.2 Test changing seal colors and finish parameters
  - [x] 4.3 Test applying generated seal to invitation and verifying rendering in `EnvelopeWrapper`
