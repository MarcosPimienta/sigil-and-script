## 1. 3D Envelope Wrapper
- [x] 1.1 Create folder and component `src/components/creator/EnvelopeWrapper.tsx`
- [x] 1.2 Implement the multi-phase states: closed sealed, breaking seal, unfolding, and slide-out
- [x] 1.3 Add envelope style classes in `src/styles/creator.css` for classic, scroll, and booklet options

## 2. Web Audio Helper Engine
- [x] 2.1 Implement procedurally synthesized audio cues inside `src/utils/audioEngine.ts` (using Web Audio API for backing ambient chords and click feedback)
- [x] 2.2 Trigger seal breaking synthesis sound effect on user seal click gesture
- [x] 2.3 Initialize and trigger ambient music loops on envelope open success

## 3. Audio Controls Integration
- [x] 3.1 Create interactive floating volume button [src/components/shared/AudioToggle.tsx](file:///home/fenix3819/sigil-and-script/src/components/shared/AudioToggle.tsx)
- [x] 3.2 Add wavelength animations indicating audio level and speaker mute status
- [x] 3.3 Link toggles to the central audio engine mute/unmute functions

## 4. Recipient Shell Integration
- [x] 4.1 Update [src/App.tsx](file:///home/fenix3819/sigil-and-script/src/App.tsx) recipient loading path to wrap `InvitationStage` with `<EnvelopeWrapper>`
- [x] 4.2 Allow guests to override audio status via floating overlay triggers

## 5. Verification
- [x] 5.1 Confirm compilation builds cleanly
- [x] 5.2 Validate that existing regression tests pass
