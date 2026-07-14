# Proposal — Cinematic Envelope Transition

## Problem
Currently, in recipient view:
- The envelope opens and a couple's Polaroid photo slides out of the envelope, and the wedding detail sections are rendered below it.
- This transition lacks a high-end cinematic experience.
- The Polaroid takes up a lot of space, and the actual invitation sections are detached.

We want to build a cinematic sequence:
1. Envelope starts closed with a wax seal.
2. Clicking the seal breaks it and opens the envelope flap.
3. A textured paper letter slides out of the envelope pocket.
4. The letter scales up smoothly to fill the entire viewport.
5. The letter paper fades out as the real interactive invitation sections fade in.
6. The couple photo/Polaroid becomes the **Event Logo** rendered at the top of the invitation sections.

---

## Proposed Solution

1. **Implement Cinematic State Pipeline**:
   - Define a series of animation phases for the envelope opening:
     * `'CLOSED'` -> Initial state.
     * `'CRACKING'` -> Seal breaks.
     * `'OPENING'` -> Flap opens.
     * `'LETTER_SLIDING'` -> Paper letter slides out of the pocket.
     * `'LETTER_SCALING'` -> Letter scales up to cover the viewport.
     * `'FADING_OUT'` -> Letter fades out, invitation details fade in.
     * `'COMPLETED'` -> Renders the interactive scrolling invitation page.

2. **Design Paper Letter Component**:
   - Create a beautiful paper card component inside the envelope pocket.
   - Style the letter as an elegant paper card with gold borders, custom script fonts, and wedding headlines.

3. **Logo Image Refactoring**:
   - Update [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx) to label the image upload "Event Logo Image" (binds to `design.openedEnvelopeImage`).
   - If uploaded, render this image as a beautifully centered logo/monogram at the top of the main invitation sections in [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx).

4. **Cinematic CSS Keyframes**:
   - Add animations in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) for:
     * Letter slide-out from pocket.
     * Scale to fill viewport.
     * Fade out overlay.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/EnvelopeWrapper.tsx` | Replace Polaroid with paper letter; configure phased timeouts for sliding, scaling, and fading. |
| `src/components/creator/CreatorCanvas.tsx` | Handle state rendering based on the expanded animation phases; display the Event Logo at the top of the invitation sections. |
| `src/components/creator/LeftPanel.tsx` | Relabel Polaroid upload control to "Event Logo". |
| `src/styles/creator.css` | Declare letter styles and scaling/fading viewport animations. |

---

## Scope Constraints

- **In-Scope**:
  - Sequence of animations from seal break to full invitation display.
  - Paper letter design and layout.
  - Event logo mounting.
- **Out-of-Scope**:
  - Custom drag-and-drop letter builder.
  - Dynamic physics-based envelope folding.
