# Design — Custom Envelope Editor

## Architectural Decisions

1. **Explicit Cover Field Names vs. Legacy Fields**:
   - `InvitationDesign` historically has `closedEnvelopeImage` (which was partially deprecated and hidden in earlier cleanups) and `openedEnvelopeImage` (which was repurposed for the inner letter logo/monogram rendered inside the sliding parchment card).
   - To prevent breaking existing invitations where `openedEnvelopeImage` is used as the letter logo, we explicitly introduce:
     - `envelopeCoverClosedImage?: string;`
     - `envelopeCoverOpenedImage?: string;`
   - We maintain backward compatibility by checking `envelopeCoverClosedImage ?? closedEnvelopeImage ?? '/ClosedEnvelope00.png'`.

2. **Preserving Alpha Transparency during Client-Side Compression**:
   - The envelope covers have transparent cutouts (the opening V-flap, transparent borders, drop shadows).
   - In `src/components/creator/uploadHelpers.ts`, `compressImage` normally defaults to `image/jpeg` which flattens alpha channels to black.
   - By adding `envelopeCoverClosedImage` and `envelopeCoverOpenedImage` to `TRANSPARENT_FIELDS`, the compression utility preserves the PNG format and alpha transparency.

3. **Editor UI Placement in `StyleTab.tsx`**:
   - The editor already groups envelope-level styling under `styleEnvelopeGroup` ("Sobre y sello" / "Envelope and seal").
   - Placing the two `ImageUploadSlot` components directly above the seal creator keeps all envelope visual assets organized in a single, intuitive place.
   - Clear indicators allow users to see when custom artwork is active, with a standard `onClear` callback enabling instant reset to the default PNG assets.

4. **Dual-Layer Animation Preservation**:
   - In `EnvelopeWrapper.tsx`, the envelope uses stacked layers:
     - `.envelope-png-layer.layer-closed` (visible during `CLOSED` and `CRACKING` phases)
     - `.envelope-png-layer.layer-opened` (visible during `OPENING`, `SLIDING`, `REVEALED`, and `COMPLETED` phases)
   - Simply replacing the static `src` attributes with dynamic design values maintains all existing CSS transitions and z-index ordering without requiring any changes to the animation state machine.

---

## Risks & Mitigations

- **Risk**: User uploads an image with an abnormal aspect ratio, stretching the envelope or breaking the pocket clipper alignment.
  - **Mitigation**: Add a clear hint in `panelStrings.ts` specifying the recommended aspect ratio (4:3 / ~440×340px) and PNG format with transparency. The container retains `object-fit: fill` and fixed relative aspect ratios.
- **Risk**: User uploads an open envelope without a matching closed envelope, or clears only one.
  - **Mitigation**: Each image slot independently defaults to the standard asset (`/ClosedEnvelope00.png` or `/OpenedEnvelope00.png`), so partial configuration always produces a coherent, functioning envelope.
- **Risk**: Large base64 images bloat payload before server upload finishes.
  - **Mitigation**: Include both new fields in `sigilStore.ts`'s payload size threshold guard (`cleanedDesign`).
