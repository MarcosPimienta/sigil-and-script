# Design — Responsive Scrolling Invitation

## Architectural Decisions

### Decision 1: Design Schema Expansion for Section Toggles
**Choice**: Extend the `InvitationDesign` schema with parameters tracking the customized elements.
**Why**:
- Centralizes state management under the same design object.
- Ensures all new widgets (Countdown, Itinerary, Dress Code, Gifts) sync and are persisted together.

```typescript
export interface ItineraryItem {
  id: string;
  title: string;
  locationName: string;
  time: string;
  mapLink?: string;
}

export interface InvitationDesign {
  // ... existing fields
  countdownTarget?: string; // e.g. "2027-02-14T18:00:00Z"
  itinerary?: ItineraryItem[];
  colorPalette?: string[]; // e.g. ["#4f5d47", "#a08e7c", "#4c4844", "#dfb88e", "#e8e5c8"]
  dressCodeText?: string; // e.g. "Formal"
  registryLink?: string;
  registryText?: string;
}
```

---

### Decision 2: Mobile-First Scrolling Flow
**Choice**: Embed the RSVP form directly at the bottom of the scrolling invitation stack when in `RECIPIENT` mode, rather than rendering it as a split side panel.
**Why**:
- Replicates the exact layout of the reference screenshots.
- Delivers a unified user experience (UX) where the user reads details first, gets excited by the countdown and timeline, and ends with the call-to-action RSVP.
- Automatically handles viewports responsively: the screen uses a fixed mobile-like card layout (`max-width: 480px`) centered on the desktop viewport, and expands to full-screen width on mobile screens.

---

### Decision 3: Custom Color Palette Hex Input and Dot Picker
**Choice**: Create a custom picker showing 5 color circular nodes that hosts can click and edit using an HTML `<input type="color">` dialog.
**Why**:
- Simple, native, and highly visual.
- Prevents messy third-party dependency imports.
