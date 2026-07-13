# Design — Edit Host Names

## Architectural Decisions

### Decision 1: Direct TextBlock Data Binding
**Choice**: Connect the input field directly to the `tb-headline` block in `design.textBlocks` instead of adding a new field to the global `design` object.
**Why**:
- Keeps the state schema clean and avoids data duplication (having host names stored in both a standalone property and a text block).
- Leverages the existing `updateTextBlock` store action, guaranteeing that on-canvas double-click edits and sidebar edits update the exact same underlying source of truth.

### Decision 2: Sidebar Field Placement in `SectionEditor`
**Choice**: Place the Host Names text input field at the top of the "Event Sections" tab (`SectionEditor.tsx`) above the countdown target field.
**Why**:
- The Host Names/Headline is the main label of the wedding event, making it logical to place it at the very top of the event metadata section.
- Keeps related event details (who, when, where, dress code, itinerary) grouped together in one tab.

---

## Risks & Mitigations

### Risk 1: Empty Host Names
- **Risk**: If the user deletes all text in the input field, the headline will be empty, which could look awkward.
- **Mitigation**: Add a placeholder `e.g. Oscar & Rocio` to the input field so it's clear what the field represents, and if they clear it, the placeholder helps guide them.
