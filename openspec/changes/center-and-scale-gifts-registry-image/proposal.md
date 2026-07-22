# Proposal: Center and Scale Gifts Registry Image

## Problem
The Gifts Registry image rendered inside `GiftsRegistryPanel` is currently left-aligned instead of centered within the card section. Additionally, users lack a control mechanism in the editor panel to scale down (or up) the custom registry image to fit their preferred layout aesthetic.

## Proposed Solution
1. **Center Alignment**: Enhance the image container in `GiftsRegistryPanel` to use flexbox centering (`display: flex; justify-content: center; align-items: center;`) and apply `margin: 0 auto` to the `<img>` element so it centers reliably despite global CSS resets (`img { display: block }`).
2. **Scale Mechanism**: Introduce `registryImageScale?: number` (percentage value between 20% and 200%, default 100%) to `InvitationDesign` and add a scale range slider in `LeftPanel` (and `SectionEditor`) under the Gifts Registry image section.

## Files to Create & Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/types/sigil.types.ts` | Modify | Add `registryImageScale?: number;` to `InvitationDesign` |
| `src/state/sigilStore.ts` | Modify | Add `registryImageScale: 100` default value to `DEFAULT_DESIGN` |
| `src/components/creator/GiftsRegistryPanel.tsx` | Modify | Center `registryImage` container and apply `registryImageScale` to calculation of `maxWidth`/`maxHeight` |
| `src/components/creator/LeftPanel.tsx` | Modify | Add range slider for `registryImageScale` when `registryImage` is present |
| `src/components/creator/SectionEditor.tsx` | Modify | Add scale control under Registry section when `registryImage` is present |
| `src/components/creator/GiftsRegistryPanel.test.tsx` | Create | Unit test suite verifying centering and scale behavior |

## Scope Constraints
- In Scope: Centering the Gifts Registry image and offering a percentage-based scale slider control in the editor.
- Out of Scope: Modifying other image slots or changing the procedural border styling of `GiftsRegistryPanel`.
