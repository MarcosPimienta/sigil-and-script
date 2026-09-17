# Proposal — Custom Envelope Editor

## Problem
Currently, the invitation envelope graphics are hardcoded to static assets (`/ClosedEnvelope00.png` and `/OpenedEnvelope00.png`) directly inside [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx#L398-L414). 
Event creators have no way from within the editor studio to change the envelope appearance, color, or artwork to match their event theme. The "Envelope and seal" section in [StyleTab.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/panel/StyleTab.tsx#L104) only allows customizing the wax seal and the inner letter logo/monogram.

## Proposed Solution
1. **Design Data Model**:
   - Add two optional fields to `InvitationDesign`:
     - `envelopeCoverClosedImage?: string;`: Custom graphic for the closed envelope state.
     - `envelopeCoverOpenedImage?: string;`: Custom graphic for the open envelope state (behind the letter).
2. **Editor Controls (`StyleTab.tsx`)**:
   - Under the "Envelope and seal" collapsible group in the Style tab, add two `ImageUploadSlot` controls:
     - **Closed Envelope** (`styleEnvelopeClosedCover`): Lets users upload or replace the closed envelope graphic, with clear/reset support.
     - **Opened Envelope** (`styleEnvelopeOpenedCover`): Lets users upload or replace the opened envelope graphic, with clear/reset support.
   - When cleared, the envelope seamlessly falls back to the default `/ClosedEnvelope00.png` and `/OpenedEnvelope00.png`.
3. **Transparency Support**:
   - Include `envelopeCoverClosedImage` and `envelopeCoverOpenedImage` in `TRANSPARENT_FIELDS` in [uploadHelpers.ts](file:///home/fenix3819/sigil-and-script/src/components/creator/uploadHelpers.ts#L76) so envelope cutouts and transparent flaps are saved as PNG without losing transparency.
4. **Envelope Renderer (`EnvelopeWrapper.tsx`)**:
   - Replace hardcoded `/ClosedEnvelope00.png` and `/OpenedEnvelope00.png` with:
     - `design.envelopeCoverClosedImage || '/ClosedEnvelope00.png'`
     - `design.envelopeCoverOpenedImage || '/OpenedEnvelope00.png'`
5. **Social Share / OpenGraph Fallback**:
   - Update server and serverless OG image resolution in `inviteController.ts` and `api/invite.js` to prioritize `data.envelopeCoverClosedImage` when available.

---

## Files to Create & Modify

| File | Modification | Purpose |
|---|---|---|
| `src/types/sigil.types.ts` | Modify | Declare `envelopeCoverClosedImage` and `envelopeCoverOpenedImage` in `InvitationDesign`. |
| `src/components/creator/uploadHelpers.ts` | Modify | Add new envelope cover fields to `TRANSPARENT_FIELDS`. |
| `src/components/creator/panel/panelStrings.ts` | Modify | Add bilingual localized labels and helper hints for the envelope upload slots (EN & ES). |
| `src/components/creator/panel/StyleTab.tsx` | Modify | Add `ImageUploadSlot` inputs for closed and opened envelope covers in the "Envelope and seal" group. |
| `src/components/creator/EnvelopeWrapper.tsx` | Modify | Bind dynamic image sources with fallback to `/ClosedEnvelope00.png` and `/OpenedEnvelope00.png`. |
| `src/state/sigilStore.ts` | Modify | Add cleanup checks for new envelope fields in `saveDesignToServer`. |
| `server/src/controllers/inviteController.ts` | Modify | Check `envelopeCoverClosedImage` when generating social preview cards. |
| `api/invite.js` | Modify | Check `envelopeCoverClosedImage` in Vercel serverless preview handler. |
| `src/components/creator/EnvelopeWrapper.test.tsx` | Modify | Add unit tests verifying custom envelope graphics render and fall back correctly. |

---

## Scope Constraints

- **In-Scope**:
  - Image upload slots for closed and opened envelopes in the editor's Style panel.
  - Live rendering of customized envelopes in both Creator Studio and Guest RSVP / Recipient views.
  - Fallback to `/ClosedEnvelope00.png` and `/OpenedEnvelope00.png` when no custom cover is set or when cleared.
  - Preserving transparent alpha channels for uploaded envelope PNGs.
  - Social sharing preview fallback integration.
- **Out-of-Scope**:
  - Procedural CSS 3D folding physics or polygon geometry generators.
  - Modifying the inner letter layout or wax seal behavior.
