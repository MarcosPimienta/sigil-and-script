# Design — Custom Song and Controls

## Architectural Decisions

### Decision 1: HTML5 Audio Integration in AudioEngine
**Choice**: Use `new Audio(url)` in the existing `AudioEngine` singleton class.
**Why**:
- Keeps audio management centralized and prevents multiple sound instances from overlapping.
- Easily handles streaming URLs (like dropbox or drive direct files) looping.
- Seamlessly falls back to procedural oscillator synths if the URL is empty.

### Decision 2: Above-Countdown Visual Controls
**Choice**: Mount `<AudioControls />` right above `<CountdownTimer />` in [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx).
**Why**:
- Satisfies "audio controls on top of the timer" request.
- Keeps controls immediately visible to the guest when looking at the countdown schedule.

---

## Risks & Mitigations

### Risk 1: Autoplay Blocked
- **Risk**: Modern browsers block programmatically-triggered audio (autoplay policy) if the user has not interacted with the document.
- **Mitigation**: The `audioEngine.playAmbient()` function is triggered on the wax seal button click (which counts as user interaction), satisfying browser security parameters and playing the custom song immediately.
