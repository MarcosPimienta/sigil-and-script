# Proposal — Inline Seal & Sticker Creator (Left Panel)

## Problem
Currently, users can only upload a raw custom PNG image for their invitation's wax seal / sticker (`stickerImage`). Users lack the ability to turn a simple logo or monogram PNG into a realistic 3D wax seal with custom colors, bevel & emboss effects, or die-cut sticker borders without using external image editing software like Photoshop. Using a modal for this creation process disjoints the user flow from the rest of the studio editor.

## Proposed Solution
We will introduce an **Inline Seal & Sticker Creator** directly within the [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx) studio control sidebar. Instead of a modal, the seal creation controls will be an expandable/collapsible section or a dedicated tab in the left panel. It will feature:
1. **Mask Image Upload**: Upload a monochrome or transparent PNG/SVG monogram or emblem.
2. **Style Selection**: Choose between **Wax Seal** (3D embossed appearance with organic wax edges and color selection) and **Sticker Label** (flat die-cut badge with custom background & border styling).
3. **Layer Effects & Color Customization**:
   - **Wax Seal**: Base color picker (red, gold, navy, burgundy, forest green, custom hex), bevel depth control, and metallic vs. matte finish toggles.
   - **Sticker Label**: Background color, border color/thickness, corner roundness/shape.
4. **Live Inline Preview**: Real-time canvas rendering of the generated seal/sticker directly in the sidebar before applying.
5. **Flatten & Apply**: Generates a high-resolution flat PNG `data:image/png` (and uploads it to storage via `/upload/media`), updating `design.stickerImage`. The existing [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx) continues to render `design.stickerImage` efficiently without performance degradation.

---

## Files to Create & Modify

| File | Change |
|---|---|
| `src/components/creator/SealCreator.tsx` | [NEW] Inline component with Canvas rendering engine for creating wax seals and stickers with bevel/emboss/color effects. |
| `src/components/creator/LeftPanel.tsx` | Integrate `SealCreator` directly into the sidebar panel, replacing the basic sticker upload field with this new inline experience. |
| `src/styles/creator.css` | Add styling for the inline Seal Creator, canvas preview container, controls, and sliders within the constraints of the sidebar width. |

---

## Scope Constraints

- **In-Scope**:
  - Building a canvas-based 2D image processing utility inside `SealCreator`.
  - Color tinting, organic wax base shape generation, drop shadow, and beveling effects on user-uploaded PNG alpha masks.
  - Exporting the generated seal canvas to `design.stickerImage` (via server upload / base64 fallback).
- **Out-of-Scope**:
  - Modifying `EnvelopeWrapper.tsx` dynamic rendering pipeline (it remains a simple static `<img>` displaying `design.stickerImage`).
  - WebGL / 3D model generation (Three.js).
