# Custom Seamless Paper Texture

## Problem
Currently, the invitation relies on predefined CSS-based colors and grain filters to simulate parchment paper. The user wants the ability to upload a custom seamless texture image that will act as the realistic parchment background for the entire invitation canvas.

## Proposed Solution
We will expose the existing `paperImage` property (already defined in `SigilDesign`) in the Studio UI by adding an Image Upload slot in the Left Panel. 
When a `paperImage` is uploaded, the `InvitationStage` component will render this texture over the base background using a `mix-blend-mode: multiply` CSS effect, combined with a repeating background pattern to ensure it seamlessly covers the canvas.

## Files to Create & Modify

| File | Modification | Purpose |
|------|--------------|---------|
| `src/components/creator/LeftPanel.tsx` | Modify | Add an `ImageUploadSlot` for `paperImage` in the Custom Artwork section. |
| `src/components/creator/InvitationStage.tsx` | Modify | Apply the `design.paperImage` as a repeating background overlay with `mix-blend-mode: multiply` to the stage grain overlay. |

## Scope Constraints
- **In-Scope**: Uploading a custom seamless image for the background, applying it via a multiply blend mode to blend realistically with the ink and base color.
- **Out-of-Scope**: Providing a library of textures to choose from (the user must upload their own), or modifying the logic for other uploaded images like the seal or event logo.
