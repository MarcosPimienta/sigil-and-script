# Design — Use Custom Church Icon

## Architectural Decisions

### Decision 1: Single Path with transparent cutouts
**Choice**: Use `fill-rule="evenodd"` inside the main building `<path>` to carve out the arched windows and double doors as transparent holes.
**Why**:
- Ensures the windows and doors remain transparent, allowing the timeline container's background color (which can vary or be customized) to show through correctly.
- Keeps the SVG highly clean, standard-compliant, and performant.

### Decision 2: Static Asset Placement
**Choice**: Write the identical SVG structure to `public/icons/church.svg`.
**Why**:
- Fulfills the user requirement to store this icon as a public static asset for future potential usage.
- Allows both static file referencing and inline component rendering.
