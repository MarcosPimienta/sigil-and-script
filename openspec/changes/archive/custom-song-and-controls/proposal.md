# Proposal — Custom Song and Controls

## Problem
Guests want to hear a custom song (ambient music) chosen by the host instead of procedural synthesizer tones. Hosts need a configuration input in the creator panel to specify the song URL (e.g. MP3 link), and guests need visual audio play/pause controls positioned above the countdown timer to control playback.

## Proposed Solution
1. **Extend Design State**: Add `musicUrl` to `InvitationDesign` in [sigil.types.ts](file:///home/fenix3819/sigil-and-script/src/types/sigil.types.ts) and initialize it in `DEFAULT_DESIGN` inside [sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts). Map it explicitly inside `saveCurrentDesign` (saving to db column `musicUrl`).
2. **Add Song URL Input Field**: In [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx), add a "Background Music" form field section with a text input mapping to `design.musicUrl`.
3. **Upgrade Audio Engine**: Extend `AudioEngine` in [audioEngine.ts](file:///home/fenix3819/sigil-and-script/src/utils/audioEngine.ts) to accept a song URL, load it using a HTML5 `Audio` node, and play/pause it loops when ambient play is requested, falling back to synthesised chords if no URL is set.
4. **Build Audio Control Widget**: Create [AudioControls.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/AudioControls.tsx) displaying play/pause toggles and equalizers.
5. **Render Controls**: Embed `<AudioControls musicUrl={design.musicUrl} />` directly above `<CountdownTimer />` in [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx) (for both recipient and host views).

---

## Files to Modify / Create

| File | Change |
|---|---|
| `src/types/sigil.types.ts` | Add optional `musicUrl` field to `InvitationDesign`. |
| `src/state/sigilStore.ts` | Initialize `musicUrl` in `DEFAULT_DESIGN` and map it in `saveCurrentDesign`. |
| `src/components/creator/LeftPanel.tsx` | Add "Background Music" song URL input field. |
| `src/utils/audioEngine.ts` | Support loading and playing/pausing custom audio URLs. |
| `src/components/creator/AudioControls.tsx` | [NEW] Create the AudioControls component containing clean play/pause toggles. |
| `src/components/creator/CreatorCanvas.tsx` | Render `<AudioControls />` above the countdown timer in both views. |
| `src/styles/creator.css` | Add pulse equalizer keyframes and hover styling for the play/pause button. |

---

## Scope Constraints

- **In-Scope**:
  - Song URL input configuration and persistence.
  - Streaming audio links loops via Audio element in AudioEngine.
  - Interactive play/pause controller above countdown timer.
- **Out-of-Scope**:
  - File upload upload size management for large MP3s (relying on raw external hotlink audio files).
