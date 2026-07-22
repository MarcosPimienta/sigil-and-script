# Technical Design: Center and Scale Gifts Registry Image

## Architectural Decisions
1. **Centering Strategy**:
   - `tokens.css` applies `display: block` to `img, svg`. Block-level images do not inherit parent `text-align: center`.
   - To guarantee centering across both desktop & mobile views without breaking layout, the wrapper `div` around `img` will use flex centering (`display: flex; justify-content: center; width: 100%`) and the `img` element itself will specify `margin: 0 auto`.

2. **Scale State Management**:
   - Store property: `registryImageScale` (number, unit: percentage, e.g., 100 = 100%).
   - Range: `20` to `200` with step `1` or `5`.
   - Dimensions calculation in `GiftsRegistryPanel`:
     - Base size limit: `120px`.
     - Calculated size: `Math.round(120 * ((registryImageScale ?? 100) / 100)) + 'px'`.
   - This ensures scaling down to 20% (24px) or scaling up to 200% (240px) works smoothly.

## Risks & Mitigations
- **Existing Invitations missing `registryImageScale`**: Default to `100` if `registryImageScale` is undefined (`registryImageScale ?? 100`), maintaining full backward compatibility.
- **Empty Panel render condition**: Update `GiftsRegistryPanel` guard from `if (!registryText && !registryLink) return null;` to `if (!registryText && !registryLink && !registryImage) return null;` so an image-only registry panel will render properly if configured.
