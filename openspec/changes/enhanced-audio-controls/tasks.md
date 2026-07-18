# Tasks: Redesigned and Enhanced Audio Controls

- [ ] 1. Audio Engine Updates
  - [ ] 1.1 Expose `getAudioElement(): HTMLAudioElement | null` in `src/utils/audioEngine.ts`.
- [ ] 2. Style Modifications
  - [ ] 2.1 Add CSS rules for `.audio-progress-slider` in `src/styles/creator.css` with clean track, custom colors (`#4c4844` / `#e5e0da`), and hidden/hover-revealed thumb.
- [ ] 3. Component Redesign
  - [ ] 3.1 Implement the new layout in `src/components/creator/AudioControls.tsx` (Header text, seek slider, controls row).
  - [ ] 3.2 Add HTMLAudioElement event listeners in `AudioControls.tsx` for `'timeupdate'`, `'durationchange'`, `'play'`, and `'pause'`.
  - [ ] 3.3 Wire up controls actions (Toggle Like, Reset track on Skip Back/Forward, Toggle play/pause, Toggle loop state).
- [ ] 4. Layout Cleanups
  - [ ] 4.1 Remove redundant standalone paragraph text prompt from `src/components/creator/CreatorCanvas.tsx`.
- [ ] 5. Verification
  - [ ] 5.1 Perform manual playback, seek, like, skip, and loop testing.
  - [ ] 5.2 Build checking (`npm run build`).
