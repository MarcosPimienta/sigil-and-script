# Design — Add Church Icon to Itinerary

## Architectural Decisions

### Decision 1: Procedural SVG Component
**Choice**: Implement the church icon as a local functional component (`ChurchIcon`) rendering a lightweight inline SVG inside [ItineraryTimeline.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/ItineraryTimeline.tsx).
**Why**:
- The project does not currently import external icon packages (like `lucide-react` or `react-icons`). Keeping it inline keeps the bundle size small and avoids adding unnecessary packages.
- A custom-crafted SVG is fully styling-compliant and can easily match the existing `CornerFlourish` design system.

### Decision 2: Text-Based Matcher for "Ceremonia Religiosa"
**Choice**: Use string-matching on `item.title` (case-insensitive check for presence of both "ceremonia" and "religiosa") to trigger the icon rendering.
**Why**:
- Users might customize spacing, case, or add details to the title, but standardizing on matching both key terms ("ceremonia" and "religiosa") ensures the icon appears for the default title and reasonable translations/variants.
- Keeping it text-driven requires no schema changes in the database or store.

---

## Risks & Mitigations

### Risk 1: Layout Shifts / Distorted Vertical Spacing
- **Risk**: Adding a 28px height SVG between the title and the location text could push down elements and overflow the decorative border frame on the card.
- **Mitigation**: Adjust margins (`margin: 0.4rem 0`) and padding, and test within the canvas preview to make sure the item fits inside the timeline container layout.
