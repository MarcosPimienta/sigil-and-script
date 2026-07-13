## 1. Modify Audio Engine Default State
- [x] 1.1 Update `isMuted` initialization in [audioEngine.ts](file:///home/fenix3819/sigil-and-script/src/utils/audioEngine.ts#L3) to `true`.

## 2. Show Audio Controls in Creator Canvas
- [x] 2.1 Update [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx#L227) to render `<AudioToggle />` unconditionally in the main container.

## 3. Fix Wax Seal Transition Render Logic
- [x] 3.1 Update [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx#L116) to only render the wax seal button when `phase` is `'CLOSED'` or `'CRACKING'`.

## 4. Verification
- [x] 4.1 Run unit tests with `npm run test` to verify no regressions.
- [x] 4.2 Run `npm run build` to confirm compiling.
