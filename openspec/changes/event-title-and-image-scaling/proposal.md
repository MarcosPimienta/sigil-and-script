# Proposal: Event Title Text/Image & Image Scaling Slider

## Problem
Currently, the section in `SectionEditor` is labeled "Nombres de los Novios (Host Names)", which is specific to weddings. Users want to rename this to "Título del Evento (Event Title)" to support generic events (birthdays, anniversaries, galas, baptisms, etc.), support uploading an image directly from the Section Editor as an alternative or complement to text, and provide an image scaling slider.

## Proposed Solution
1. **Rename Label**: Update the editor field label from "Nombres de los Novios (Host Names)" to "Título del Evento (Event Title)".
2. **Text or Image Support**: Integrate an image upload slot in `SectionEditor` under "Título del Evento" alongside the text input field for `openedEnvelopeImage`.
3. **Scale Slider**: Add `openedEnvelopeImageScale?: number` (20% to 200%, default 100%) to `InvitationDesign` and render scaling sliders in both `SectionEditor` and `LeftPanel`.
4. **Render in Invitation Canvas**: Update `EnvelopeWrapper` to apply the scaling slider value (`openedEnvelopeImageScale`) to the event title image.

## Files to Create & Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/types/sigil.types.ts` | Modify | Add `openedEnvelopeImageScale?: number;` to `InvitationDesign` |
| `src/state/sigilStore.ts` | Modify | Add default `openedEnvelopeImageScale: 100` in `DEFAULT_DESIGN` |
| `src/components/creator/SectionEditor.tsx` | Modify | Update label to "Título del Evento", add image uploader & scale slider |
| `src/components/creator/LeftPanel.tsx` | Modify | Update label for event logo and add scale slider under `upload-opened-envelope` |
| `src/components/creator/EnvelopeWrapper.tsx` | Modify | Apply `openedEnvelopeImageScale` to event title image rendering |
| `src/components/creator/EnvelopeWrapper.test.tsx` | Modify/Create | Add unit test verifying event title image scaling |

## Scope Constraints
- In Scope: Renaming field label, enabling text and image configuration for event title, adding scale slider, updating canvas rendering and tests.
- Out of Scope: Changing envelope opening animations or wax seal logic.
