# Technical Design: SVG Path Font-Color Painting

## Architectural Decisions

1. **SVG XML Recoloring Algorithm**:
   - `recolorSvg(svgString, targetColor)`:
     - Replaces `fill="(?!none)[^"]*"` with `fill="${targetColor}"`.
     - Replaces `stroke="(?!none)[^"]*"` with `stroke="${targetColor}"`.
     - Replaces inline styles `fill:\s*(?!none)[^;"]+` and `stroke:\s*(?!none)[^;"]+`.
     - Injects `fill="${targetColor}"` on the root `<svg>` tag if no fill attribute is defined.
   - For `data:image/svg+xml;base64,...`, decodes base64 string using `atob()`, recolors SVG XML, and encodes as `data:image/svg+xml;utf8,${encodeURIComponent(recoloredSvg)}`.
   - For remote/HTTP `.svg` files, fetches text content asynchronously, recolors SVG XML, and sets state to recolored Data URL.

2. **Color Palette Mapping**:
   - Closed Envelope Header: `color="var(--paper-parchment, #f4ecd8)"` (matches `.envelope-header-title`).
   - Unfolded Letter Card: `color="#111111"`.
   - Parchment Stage: `color="var(--color-sepia-800, #4c4844)"`.
