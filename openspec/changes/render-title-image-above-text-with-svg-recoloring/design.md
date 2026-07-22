# Technical Design: Render Title Image Above Title Text with SVG Recoloring

## Architectural Decisions

1. **SVG Path Color Painting Strategy**:
   - For SVG data URLs (`data:image/svg+xml`) or `.svg` files, use CSS `mask-image`:
     ```tsx
     <div
       role="img"
       aria-label={alt}
       style={{
         width: `${scaledWidth}px`,
         height: `${scaledHeight}px`,
         backgroundColor: fontColor, // Paints all SVG paths with target font color
         WebkitMaskImage: `url("${src}")`,
         WebkitMaskSize: 'contain',
         WebkitMaskPosition: 'center',
         WebkitMaskRepeat: 'no-repeat',
         maskImage: `url("${src}")`,
         maskSize: 'contain',
         maskPosition: 'center',
         maskRepeat: 'no-repeat',
       }}
     />
     ```
   - For non-SVG images (PNG/JPEG), fallback to standard `<img src={src} />`.

2. **Positioning & Layout**:
   - Both `headerImage` (Title Image) and `hostNames` (Title Text) are rendered together.
   - Ordering: `headerImage` is placed directly above `hostNames` / `tb-headline`.
   - Scale multiplier: `(headerImageScale ?? 100) / 100`.

## Risks & Mitigations
- Non-SVG images: Standard `<img>` renders without mask transformation, preserving original colors for photos and pre-rendered PNG graphics.
