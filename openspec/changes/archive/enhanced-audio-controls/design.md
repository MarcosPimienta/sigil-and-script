# Design: Redesigned and Enhanced Audio Controls

This document details the architectural decisions and risk mitigations for the redesigned audio player interface.

## Architectural Decisions

### 1. Unified Event-Driven State Synchronization
Instead of manually synchronizing React state with programmatic audio play/pause calls, `AudioControls` will hook directly into the standard HTMLAudioElement events:
- `'timeupdate'` -> updates `currentTime` state.
- `'durationchange'` -> updates `duration` state.
- `'play'` and `'pause'` -> updates `isPlaying` state.

**Trade-offs/Reasoning**:
- Prevents state de-synchronization when external components like the floating `AudioToggle` call `audioEngine.setMute()`.
- Guarantees accurate seek slider representation.

### 2. Custom CSS Native Range Input Slider
To render a custom seek bar matching the minimalist mockup, we style a standard `<input type="range">`.
- **Reasoning**: Native inputs are accessible, handle drag/click events out of the box, and have excellent performance.
- We hide the default thumb in normal state, and display a tiny elegant circle thumb on hover to denote interactive capabilities.

### 3. AudioEngine Getter Exposure
Instead of refactoring the entire singleton `audioEngine` state to reactively push playhead ticks (which would add unnecessary complexity), we expose the `audioEl` reference.
- **Reasoning**: Keeps the `AudioEngine` class simple and lightweight, while component-level side-effects handle standard HTML5 event listeners.

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Audio element is null when component mounts | Return early or do not bind listeners if `audioEngine.getAudioElement()` is null. Wait for `musicUrl` effect to initialize it. |
| Progress bar shows `NaN` before metadata loads | Default `duration` state to `0` or `100` and guard divisions by checking if `duration > 0`. |
| Conflict with floating `AudioToggle` state | Since both components toggle mute/play status via `audioEngine`, the HTMLAudioElement's `'play'` and `'pause'` events act as the single source of truth, synchronizing both components. |
