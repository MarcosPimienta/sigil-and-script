# Design for Custom Paper Texture

## Architectural Decisions

1. **Multiply Blend Mode Overlay**: Instead of applying the `paperImage` as the root `background-image` of the canvas, we will inject it into the `.stage-grain-overlay` element (or add a new `.stage-texture-overlay` element) that sits above the base background color but below the text and borders. 
   - By setting this overlay to `mix-blend-mode: multiply` and `opacity: 0.8` (or similar), the texture's shadows and highlights will interact realistically with the base paper color. The ink (text/borders) will be drawn *on top* of this texture, giving a highly authentic printed-on-parchment feel.
2. **Repeating Background**: The image will be applied with `background-repeat: repeat` so that any uploaded seamless texture automatically tiles to fill the dynamic, flowing height of the invitation canvas.
3. **Reusing LeftPanel Components**: We will reuse the existing `ImageUploadSlot` component in `LeftPanel.tsx` to handle the file selection, compression, and base64 conversion of the texture, keeping the data flow identical to the event logo and seal.

## Risks & Mitigations

- **Risk**: The uploaded texture is too dark, rendering the text unreadable due to the multiply blend mode.
  - **Mitigation**: The `mix-blend-mode: multiply` will darken the base color, but since the text is `#4c4844` (dark ink) or `#ffffff` (light ink), it generally works well. We will ensure the texture overlay doesn't obscure the text by keeping it beneath the content layer (`z-index`).
- **Risk**: Image size bloats the payload.
  - **Mitigation**: The `ImageUploadSlot` utilizes the built-in `compressImage` utility, ensuring the background texture remains lightweight before saving it into the Redux state.
