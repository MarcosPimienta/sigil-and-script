# Proposal: SVG Path Font-Color Painting & Header Color Adjustments

## Problem
In the closed envelope header view (on dark backdrop), the SVG title artwork currently renders with its original black fills (`#000000`/`#111111`), making it hard to see against the dark background. Users want SVG vector paths to automatically take on the exact font color of each respective view (light parchment `#f4ecd8` / `#e0cfa9` on dark background, dark ink `#111111` / `#4c4844` on parchment paper).

## Proposed Solution
1. **Dynamic SVG Vector Path Recoloring (`SvgColorImage`)**:
   - Enhance `SvgColorImage.tsx` to parse inline/uploaded/remote SVG content and replace all vector element fills (`fill="..."`) and stroke attributes (`stroke="..."`) with the target font color.
   - Re-encode into data URLs (`data:image/svg+xml;utf8,...`) to guarantee 100% reliable rendering across all browsers.
2. **View Color Configuration**:
   - Closed Envelope Header View: Pass `color="var(--paper-parchment, #f4ecd8)"` (or `#f4ecd8`) so SVG artwork matches the date & header font color.
   - Unfolded Letter View: Pass `color="#111111"`.
   - Stage Canvas View: Pass `color="var(--color-sepia-800, #4c4844)"`.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/components/common/SvgColorImage.tsx` | Modify | Implement SVG XML parser/recolorer for base64, inline, and HTTP SVG sources |
| `src/components/creator/EnvelopeWrapper.tsx` | Modify | Pass `var(--paper-parchment, #f4ecd8)` font color for closed view header |
| `src/components/creator/EnvelopeWrapper.test.tsx` | Modify | Add test case verifying SVG path recoloring and view rendering |

## Scope Constraints
- In Scope: SVG fill/stroke path recoloring to font color, updating view color tokens, verifying tests.
- Out of Scope: Altering raster PNG/JPEG pixel colors or database models.
