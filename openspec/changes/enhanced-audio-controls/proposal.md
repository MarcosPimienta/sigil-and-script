# Proposal: Redesigned and Enhanced Audio Controls

## Problem
The current audio control component is limited to a single, simple play/pause/mute button, lacking modern playback features like a seek bar/progress bar, loop toggling, skip controls, and visual like functionality. This doesn't align with the premium, minimalist design aesthetics requested for the wedding invitation player.

## Proposed Solution
We will redesign the audio controls component to match the reference design:
- Sleek, custom-styled seek bar/progress slider showing song progress.
- Fully synchronized React state listening to native HTMLAudioElement events.
- Additional premium music control buttons:
  - Heart (Like) button with filled/outline state toggle.
  - Previous track button to restart the song.
  - Center Play/Pause button styled with a circular outline.
  - Next track button to restart the song.
  - Loop/Repeat button to toggle native audio looping with visual active feedback.

## Files to Create & Modify

| File Path | Action | Purpose |
| --- | --- | --- |
| `src/utils/audioEngine.ts` | Modify | Expose the underlying `HTMLAudioElement` instance via a getter. |
| `src/components/creator/AudioControls.tsx` | Modify | Rebuild the component layout, controls, states, and icons. |
| `src/components/creator/CreatorCanvas.tsx` | Modify | Remove the redundant external text prompt. |
| `src/styles/creator.css` | Modify | Add CSS classes for the progress slider and player states. |

## Scope Constraints
### In-Scope
- Seek bar functionality allowing dragging/clicking to seek.
- Toggling play/pause status natively.
- Interactive Heart button (local React state toggle).
- Skip previous/next buttons restarting the track.
- Loop toggle mapping directly to the audio element's loop state.
- Redesigned visual layout matching the prompt's image.

### Out-of-Scope
- Playback of multiple distinct songs (the application currently only supports a single `musicUrl` field).
- Saving the "Liked" state persistently to a database (it will remain as local UI component state).
