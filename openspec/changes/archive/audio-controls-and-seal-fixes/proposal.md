# Proposal — Audio Controls and Wax Seal Transition Fixes

## Problem
1. **Audio Controls Invisible in Editor**: The `<AudioToggle />` button is only rendered when `isRecipient` is true (`{isRecipient && <AudioToggle />}`). During editor usage (Host Editor mode), creators cannot see, toggle, or preview the ambient audio.
2. **Audio Plays Immediately on Open**: The audio starts playing automatically when unmuted or opened. The user expects the audio to start silent by default, allowing the guest to manually unmute it if they wish.
3. **Wax Seal Re-appears during Transition**: Clicking the wax seal transitions the phase from `CLOSED` -> `CRACKING` -> `OPENING` -> `SLIDEOUT`. During `CRACKING`, the seal fades out (opacity transitions to 0). But when the phase becomes `OPENING`, it is still rendered (since the render condition is `phase !== 'SLIDEOUT'`), but the `.cracking` class is no longer present. This resets the seal opacity back to 1, causing a brief flicker where the seal re-appears on screen before unmounting during `SLIDEOUT`.

## Proposed Solution
1. **Unconditional Audio controls**: Update [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx) to render `<AudioToggle />` regardless of the current view mode, so both editors and recipients have access to the controls.
2. **Default Mute State**: Change the initial state of the audio engine in [audioEngine.ts](file:///home/fenix3819/sigil-and-script/src/utils/audioEngine.ts) to muted by default.
3. **Wax Seal Unmounting**: Adjust the wax seal render condition in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx) to only mount the seal during the `CLOSED` and `CRACKING` phases. Once it moves to the `OPENING` phase, the seal will be unmounted directly, preventing it from showing up again.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/CreatorCanvas.tsx` | Render `<AudioToggle />` unconditionally in the canvas container. |
| `src/utils/audioEngine.ts` | Set the initial value of `isMuted` to `true`. |
| `src/components/creator/EnvelopeWrapper.tsx` | Constrain the wax seal render condition to `phase === 'CLOSED' || phase === 'CRACKING'`. |

---

## Scope Constraints

- **In-Scope**:
  - Making audio controls visible in both Creator and Recipient modes.
  - Initializing the audio playback state to muted/silent.
  - Fixing the wax seal transition glitch where it re-appears during the `OPENING` phase.
- **Out-of-Scope**:
  - Modifying the styling or animations of the Audio Toggle button itself.
  - Adding track selection or volume sliders.
