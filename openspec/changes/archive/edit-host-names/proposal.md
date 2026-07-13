# Proposal — Edit Host Names

## Problem
The host names (defaulting to `"Oscar & Rocio"`) are stored in the text block with ID `tb-headline`. Currently:
1. There is no input field in the sidebar control panels to view or edit this headline.
2. The closed envelope view displays the host names statically, meaning a user cannot edit them in-situ on the cover.
3. To edit the names, the host would have to open the envelope, scroll to the card canvas, double-click the headline block, and edit it. This is unintuitive and hidden.

## Proposed Solution
- Add a text input field at the top of the "Event Sections" tab (located in [SectionEditor.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/SectionEditor.tsx)) to edit the host names directly.
- The input field will fetch the value from the text block with ID `tb-headline`.
- Any changes in this input field will trigger `updateTextBlock('tb-headline', { content: value })` to save the updated names in the store. This will instantly synchronize the host names across the sidebar, the main card canvas, and the closed/opened envelope views.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/SectionEditor.tsx` | Add the host names input field and connect it to read/write from the `tb-headline` text block using the store's `updateTextBlock` action. |

---

## Scope Constraints

- **In-Scope**:
  - Adding a "Host Names" text input in the `SectionEditor` component.
  - Reading the default or customized headline content from the store.
  - Updating the `tb-headline` block in the state when the input changes.
- **Out-of-Scope**:
  - Adding controls to add new text blocks or delete existing ones.
  - Customizing the font family or font size of the host names from the sidebar panel (this can already be edited on-canvas once selected).
