# Technical Design: Toast Glass Icon Rendering in Itinerary Timeline

## Architectural Decisions

1. **Title Matching Condition**:
   - Check `item.title.toLowerCase()` for keywords: `recepción`, `recepcion`, `fiesta`, `brindis`.
2. **Icon Rendering**:
   - Component: `<SvgColorImage src="/icons/toast-glass.svg" alt="Recepción" color="#ffffff" maxWidth={36} maxHeight={36} style={{ margin: '0.2rem 0 0.4rem 0' }} />`
