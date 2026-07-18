## 1. State Expansion & Input Panel
- [x] 1.1 Add optional `musicUrl` field to `InvitationDesign` in [sigil.types.ts](file:///home/fenix3819/sigil-and-script/src/types/sigil.types.ts).
- [x] 1.2 Initialize `musicUrl: ''` in `DEFAULT_DESIGN` and map it inside `saveCurrentDesign` in [sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts).
- [x] 1.3 Add song URL input fields in [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx).

## 2. Audio Engine Custom Sound Support
- [x] 2.1 Update [audioEngine.ts](file:///home/fenix3819/sigil-and-script/src/utils/audioEngine.ts) to support loading, looping, playing and pausing custom audio urls.

## 3. Audio Control Panel Rendering
- [x] 3.1 Create [AudioControls.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/AudioControls.tsx) containing play/pause toggles and animated sound wave bars.
- [x] 3.2 Add pulse equalizer keyframes and play/pause button hover animations in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css).
- [x] 3.3 Embed `<AudioControls />` above `<CountdownTimer />` in [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx) (recipient and host editor views).

## 4. Verification
- [x] 4.1 Run tests with `npm run test` to verify no regressions.
- [x] 4.2 Run `npm run build` to confirm compilation.
