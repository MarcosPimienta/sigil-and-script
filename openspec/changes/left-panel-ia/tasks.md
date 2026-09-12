# Tasks: Left Panel Information Architecture

## 1. Foundations

- [ ] 1.1 `src/types/sigil.types.ts`: `PanelTab = 'EVENT' | 'SECTIONS' | 'STYLE'`; `InvitationDesign.defaultFonts?: SectionFonts`.
- [ ] 1.2 `src/state/sigilStore.ts`: `panelTab` (default `'SECTIONS'`), `setPanelTab`; `focusInspector` switches to `'SECTIONS'` when focusing a section.
- [ ] 1.3 `src/components/creator/panel/panelStrings.ts` + `usePanelStrings()` hook.
- [ ] 1.4 `src/components/creator/panel/CollapsibleGroup.tsx` — disclosure with a collapsed-value summary.
- [ ] 1.5 Store tests: `setPanelTab`; focusing a section from the preview switches the tab.

## 2. Shell

- [ ] 2.1 `PanelShell.tsx`: header (name, type/language/date chips), tab bar, body slot, footer.
- [ ] 2.2 Flex column, `height: 100%`, only the body scrolls.
- [ ] 2.3 `LeftPanel.tsx` becomes the shell mount; keep `ImageUploadSlot`, `compressImage`, `ACCEPTED_IMAGE_TYPES`, `MAX_IMAGE_BYTES` exported (other modules import them).
- [ ] 2.4 `creator.css`: `.lp-shell`, `.lp-tabs`, `.lp-tab`, `.lp-body`, `.lp-footer`.

## 3. Evento tab

- [ ] 3.1 Event-type picker over `EVENT_TEMPLATES` (6-cell grid, current type selected).
- [ ] 3.2 Hosts/title (`tb-headline`), date, time, venue, RSVP deadline.
- [ ] 3.3 Language toggle, moved from `SectionEditor`'s `generalFields`.
- [ ] 3.4 Preview-guest name, labelled as preview-only.
- [ ] 3.5 Tests: editing each field reaches the store; switching type keeps content.

## 4. Secciones tab

- [ ] 4.1 Slim rows: grip, icon, name, singleton cap badge, eye, chevron.
- [ ] 4.2 Pointer-event drag reorder committing through `reorderSections`; ▲/▼ kept for keyboard on the focused row.
- [ ] 4.3 Palette as a full-panel view with a search box; singleton kinds greyed with a reason.
- [ ] 4.4 RSVP duplicate/missing warnings kept, rendered above the list.
- [ ] 4.5 Tests: add, hide, remove, reorder by keyboard, palette caps.

## 5. Section inspector

- [ ] 5.1 `SectionInspector.tsx`: back arrow, section name, Contenido/Tipografía tabs, delete footer.
- [ ] 5.2 Export `CountdownFields`, `GiftsFields`, `ItineraryFields` from `SectionEditor.tsx`; compose by kind.
- [ ] 5.3 RSVP inspector renders `FormConfiguratorPanel`; delete the root-level block.
- [ ] 5.4 Gifts inspector takes the registry image + scale.
- [ ] 5.5 Music inspector takes the song upload; delete the root-level "Background Music" section.
- [ ] 5.6 Tipografía tab renders the existing `SectionFontFields`.
- [ ] 5.7 Tests: every catalogue kind renders a non-empty inspector; RSVP toggles reach the store from inside the inspector.

## 6. Estilo tab

- [ ] 6.1 Tipografía predeterminada: heading/body pickers writing `design.defaultFonts`.
- [ ] 6.2 `SectionStack` applies `sectionFontVars(design.defaultFonts)` at its root.
- [ ] 6.3 Sobre y sello: envelope logo + scale, seal creator, sticker, seal size.
- [ ] 6.4 Papel y textura: texture + brightness/contrast/saturation.
- [ ] 6.5 Marco y bordes: frame image; title image + scale.
- [ ] 6.6 Tests: an unset `defaultFonts` sets no CSS variables on the stack root; a set one is overridden by a section's own font.

## 7. Verification

- [ ] 7.1 `npm run build`, `npm test`, `npm run lint` — no new errors.
- [ ] 7.2 Every row of the design's relocation table exercised by hand in the browser.
- [ ] 7.3 Save, reload, and confirm `designData` round-trips; a legacy invitation opens unchanged.
- [ ] 7.4 Guest `/invite/:token` view compared before and after — pixel-identical for a design with no `defaultFonts`.
- [ ] 7.5 On archive: milestone `M12_LEFT_PANEL_IA`; merge the delta spec.
