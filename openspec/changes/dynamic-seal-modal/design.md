# Design — Inline Seal & Sticker Creator (Left Panel)

## Technical Architecture

### 1. Canvas-Based Image Processor (`SealCreator.tsx`)
The inline component uses HTML5 Canvas 2D context to render the preview and generate the final PNG asset directly within the sidebar.

#### Wax Seal Rendering Pipeline:
1. **Wax Base**: Draw an organic, slightly irregular circle/blob using multi-layered radial gradients and subtle noise/waves to mimic a melted wax pool.
2. **Color Tint**: Apply the selected wax base color using radial lighting gradients (lighter center, darker rim).
3. **Bevel & Emboss Mask Processing**:
   - Load user's uploaded PNG mask onto an off-screen canvas.
   - Perform alpha-based heightmap estimation (detecting edges from alpha transparency gradient).
   - Draw highlights (white offset top-left) and shadows (dark offset bottom-right) layered over the emblem mask to construct the 3D Bevel & Emboss effect.
   - For metallic finish, apply a high-contrast specular shine layer.
4. **Lip / Outer Rim**: Draw a raised wax rim around the border of the seal with inner and outer shadows.

#### Sticker Rendering Pipeline:
1. **Base Shape**: Render a smooth badge (circle, rounded rectangle, or shield) filled with background color.
2. **Die-Cut Border**: Render a customizable stroke border around the shape.
3. **Emblem Placement**: Overlay the user's uploaded image cleanly in the center.

### 2. Export & Storage Flow
1. Upon clicking "Apply to Invitation", `canvas.toDataURL('image/png')` exports a high-resolution 512x512 PNG.
2. The image data is sent to `apiFetch('/upload/media')` to store in Supabase storage (`invitation-images` bucket), with base64 data URL fallback.
3. `updateDesign({ stickerImage: publicUrl || dataUrl })` updates the Sigil design state.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **CORS issues with uploaded image URLs** | Ensure images uploaded in the creator use `crossOrigin = "anonymous"` when drawn to canvas. Native file upload FileReader data URLs won't face CORS issues. |
| **Performance lag during slider adjustments** | Use `requestAnimationFrame` debouncing when redrawing the preview canvas upon slider/color input changes. |
| **Edge cases with non-transparent PNGs** | Provide an explicit prompt/hint in the UI advising users to upload transparent background PNG/SVG files for best wax seal results. |
