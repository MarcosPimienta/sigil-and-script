# Design — Audio Controls and Wax Seal Transition Fixes

## Architectural Decisions

### Decision 1: Render Audio Controls Unconditionally
**Choice**: Remove the conditional `isRecipient &&` wrapper from `<AudioToggle />` in `CreatorCanvas.tsx`.
**Why**:
- Ensures that both creators and guests can manage sound output.
- Avoids having to duplicate audio toggling logic or components inside the left config panels.
- Maintains visual symmetry with fixed layout positioning.

### Decision 2: Default Mute State in Singleton Engine
**Choice**: Initialize `private isMuted: boolean = true;` inside the `AudioEngine` class.
**Why**:
- The `AudioEngine` instance is exported as a singleton `audioEngine`.
- Components such as `AudioToggle` query this state directly on initialization (`useState(audioEngine.getMuted())`).
- Synchronizing this at the engine class definition ensures that any client component immediately starts in the correct state, and autoplay triggers are skipped on initial load.

### Decision 3: Narrowed Wax Seal Render Window
**Choice**: Only render the wax seal component when `phase === 'CLOSED' || phase === 'CRACKING'`.
**Why**:
- During the `CLOSED` phase, the seal needs to accept user clicks.
- During the `CRACKING` phase, the seal displays the cracking line and transitions its opacity to 0 over 500ms.
- Once the transition ends (600ms), the phase shifts to `OPENING`. By unmounting the seal immediately during `OPENING`, we prevent it from being rendered without the `.cracking` class, which previously caused it to jump back to full opacity.

---

## Risks & Mitigations

### Risk 1: Audio Playback Blocks (Autoplay Policies)
- **Risk**: Browsers block Web Audio Context audio creation/play calls unless a user interaction has occurred.
- **Mitigation**: The design does not attempt to play sound on load. The sound engine is only played after a click on the wax seal or by manually toggling the unmute button, both of which are valid user interactions that satisfy browser autoplay policies.

### Risk 2: Test Regressions
- **Risk**: Changes to the phase rendering of `EnvelopeWrapper` could break the unit tests checking for the wax seal button.
- **Mitigation**: Verified [EnvelopeWrapper.test.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.test.tsx). The tests only assert the seal's presence during the initial `CLOSED` state and verify callbacks on click, which remain unchanged.
