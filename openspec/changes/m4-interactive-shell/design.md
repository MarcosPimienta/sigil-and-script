# Design — Milestone M4: Multi-Phase Envelope Animations & Ambient Audio Triggers

## Architectural Decisions

### Decision 1: Pure CSS 3D Transformations for the Envelope Opening Pipeline
**Choice**: Use standard CSS transitions and 3D transforms (`perspective: 1200px`, `rotateX`, `translateY`) to animate the envelope flap folding, seal crack, and card slide-out sequence.
**Why**:
- Guarantees 60fps rendering hardware-accelerated by the browser's GPU.
- Minimizes external JS rendering overhead, avoiding large packages.
- Easy to manage state transitions using standard React class names (e.g., `.is-opened`, `.is-seal-cracked`).

---

### Decision 2: Wax Seal Gesture-Based Audio Autoplay Activation
**Choice**: Initialize the audio engine when the user clicks the wax seal.
**Why**:
- Browsers block audio autoplay until a direct user gesture (click/tap) is received.
- Clicking the wax seal serves as the ideal activation trigger. The click cracks the seal, triggers a crack sound effect, and immediately starts playing ambient music.

---

### Decision 3: Floating Soundwave Indicator UI
**Choice**: Create a custom SVG animatable wave volume button.
**Why**:
- Simple visual feedback indicating sound state.
- Floating design fits clean layouts perfectly without overlaying critical invite details.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Autoplay block errors | Wrap audio plays in a `.catch()` block. If blocked, show a mute indicator so the user can click to unmute. |
| 3D transform visual glitches | Use `backface-visibility: hidden` and `transform-style: preserve-3d` to prevent clipping artifacts. |
| Missing external sound files | Fallback to procedurally generated synth notes (using Web Audio API OscillatorNode) if external MP3 streams fail to load. |
