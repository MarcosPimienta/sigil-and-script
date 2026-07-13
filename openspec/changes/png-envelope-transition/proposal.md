# Proposal — Image-Based Envelope with Fade-in Title & Photo Transition

## Problem
The current envelope is built using CSS polygon flaps, which does not match the custom asset look and flow shown in the reference screenshots. The user has two custom PNG files (`ClosedEnvelope00.png` and `OpenedEnvelope00.png`) representing the closed and opened states of the envelope. They want the invitation opening flow to:
1. Load these two custom PNG images instead of the CSS-drawn flaps.
2. Render the interactive wax seal on top of the closed envelope.
3. Upon clicking the seal, crack/open the envelope, switch to the open envelope image, and animate both the couple photo and the title ("Oscar & Rocio") above the envelope to slide up and fade in.

## Proposed Solution

1. **Asset Location Guidelines**:
   - Instruct the event host to place `ClosedEnvelope00.png` and `OpenedEnvelope00.png` inside the `public/` directory of the project, mapping them directly to `/ClosedEnvelope00.png` and `/OpenedEnvelope00.png`.
2. **Refactor Envelope Rendering**:
   - Rewrite `EnvelopeWrapper.tsx` to remove the CSS-drawn flaps (`envelope-back`, `envelope-top-flap`, etc.).
   - Render the custom images stacked together. Use CSS opacity transitions to smoothly cross-fade from the closed image to the opened image.
   - Position the interactive wax seal in the absolute center on top of the closed envelope.
3. **Animate Photo & Title Slide-Up**:
   - Position the couple's photo and the text title inside the envelope wrapper.
   - Use CSS classes to control transition states: when the envelope is closed (`CLOSED`, `CRACKING`), the title and photo have an opacity of `0` and are shifted downwards.
   - When the envelope starts opening (`OPENING`, `SLIDEOUT`), animate both elements to fade in (`opacity: 1`) and slide up (`translateY` or `translate(-50%, -65%)`) to their final positions.
4. **Clean up Creator Canvas**:
   - Align `CreatorCanvas.tsx` with this cover sequence, removing separate redundant section layouts and centering the cover flow.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/EnvelopeWrapper.tsx` | Refactor render structure to stack PNG images, position the wax seal button, and handle couple photo slide-up / title animations. |
| `src/components/creator/CreatorCanvas.tsx` | Adapt the recipient viewport layout to display the unified envelope cover, handling date display and footer play elements. |
| `src/styles/creator.css` | Add styling tokens and animation properties for the PNG image layers, couple photo slide-up, and title text transitions. |

---

## Scope Constraints

- **In-Scope**:
  - Transitioning envelope from CSS flaps to custom PNG image layers.
  - Adding slide-up/fade-in transitions for the photo and title.
  - Positioning the wax seal button on top of the PNG image.
- **Out-of-Scope**:
  - Modifying state properties in `sigilStore.ts`.
  - Creating new database models.
