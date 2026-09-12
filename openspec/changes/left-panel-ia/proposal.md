# Proposal: Left Panel Information Architecture

**Change ID:** `left-panel-ia`
**Created:** 2026-09-12
**Status:** Approved — mockup reviewed

## Problem

The Invitation Studio's left panel is a single ~2150px scroll with no organising
principle. It is not cluttered because it has too many controls; it is cluttered
because unrelated controls are adjacent. Three specific failures:

1. **Section-scoped settings sit at the top level.** "RSVP Form Controls" is a
   root-level block that configures exactly one section. The gifts-registry
   image lives under "Custom Artwork" but belongs to the Gifts section. The
   "Background Music" upload duplicates the AUDIO section the host can already
   add and remove. Each one looks global and is not.

2. **The inspector pushes instead of replacing.** `SectionEditor` renders
   *below* `SectionsPanel`, so focusing a long section (Itinerary, Dress code)
   shoves the section list off-screen. The longer the section, the further the
   list goes — exactly when the host most wants to switch between sections.

3. **Order does not match the job.** Event date, venue and RSVP deadline are the
   first things a host fills in, and they are last in the panel, below four
   paper-texture sliders.

A fourth, smaller problem runs through all of it: labels mix Spanish and English
in the same panel ("Custom Artwork", "Textura de Fondo (Seamless Texture)"),
though the invitation itself is fully bilingual.

## Proposed Solution

Three top-level tabs and exactly one level of drill-down. No control is removed;
every control gains a home that explains what it affects.

1. **Evento** — the facts about the event. Event-type picker (the existing
   templates), hosts/title, date, venue, RSVP deadline, language, and the
   preview-guest name, explicitly labelled as affecting only the host's preview.
2. **Secciones** — the content. The section list alone, sized to fit without
   scrolling: drag handle, icon, name, visibility eye, and a chevron that
   *enters* the section. "Agregar" opens the section palette as a full-panel
   view rather than an inline drawer.
3. **Estilo** — what is global about the look. Default typography, envelope and
   seal, paper texture, frame — as collapsible groups, each showing its current
   value when collapsed.

**The section inspector replaces the list** rather than pushing it, with a back
arrow to return. Inside it, two tabs: *Contenido* (the section's own fields) and
*Tipografía* (the existing per-section font overrides). Destructive actions —
delete — live alone in a footer, away from the visibility toggle they are
currently one pixel from.

**Section-scoped controls move into their sections.** The RSVP form
configuration renders inside the RSVP inspector; the registry image inside
Gifts; the song upload inside Music. The duplicate global "Background Music"
block is deleted.

### One genuine addition

Default typography is today two constants in `src/utils/fonts.ts`. Estilo gains
a pair of pickers writing `design.defaultFonts`, applied as CSS variables on the
section-stack root so per-section overrides continue to win by normal CSS
cascade. This makes the per-section overrides comprehensible: they now override
something the host chose, not a constant they cannot see.

### One behavioural change

Section rows swap ▲/▼ buttons for a drag handle. `reorderSections(ids)` already
exists in the store; the drag is hand-rolled on pointer events (no dependency)
and ▲/▼ remain available to keyboard users via the focused row, so nothing
becomes keyboard-inaccessible.

## Files to Create & Modify

| File | Action | Purpose |
|---|---|---|
| `src/components/creator/panel/PanelShell.tsx` | Create | Header, tab bar, routed body, footer. |
| `src/components/creator/panel/EventTab.tsx` | Create | Event type, details, language, preview guest. |
| `src/components/creator/panel/SectionsTab.tsx` | Create | List, drag reorder, palette view, inspector routing. |
| `src/components/creator/panel/SectionInspector.tsx` | Create | Drill-down with Contenido/Tipografía tabs and a delete footer. |
| `src/components/creator/panel/StyleTab.tsx` | Create | Collapsible global-appearance groups. |
| `src/components/creator/panel/CollapsibleGroup.tsx` | Create | Shared disclosure with a collapsed-value summary. |
| `src/components/creator/panel/panelStrings.ts` | Create | One ES/EN string table for the whole panel. |
| `src/components/creator/LeftPanel.tsx` | Modify | Becomes the shell mount; upload helpers stay exported. |
| `src/components/creator/SectionEditor.tsx` | Modify | Per-kind field groups exported for the inspector. |
| `src/components/creator/SectionsPanel.tsx` | Modify | Row chrome slimmed; palette extracted. |
| `src/components/creator/sections/SectionStack.tsx` | Modify | Apply `design.defaultFonts` at the stack root. |
| `src/types/sigil.types.ts` | Modify | `InvitationDesign.defaultFonts?: SectionFonts`; `PanelTab`. |
| `src/state/sigilStore.ts` | Modify | `panelTab` state and `setPanelTab`. |
| `src/utils/normalizeDesign.ts` | Modify | Leave `defaultFonts` absent when unset (no migration). |
| `src/styles/creator.css` | Modify | Panel shell, tabs, rows, inspector, disclosure styles. |
| `openspec/specs/sigil_and_script_spec.json` | Modify (on archive) | Milestone `M12_LEFT_PANEL_IA`. |

## Scope Constraints

### In scope

- The three-tab shell, the drill-down inspector, and the palette view.
- Relocating every existing control; deleting the duplicate music block.
- `design.defaultFonts` and its two pickers.
- Drag-to-reorder sections, with keyboard move preserved.
- One ES/EN string table so the panel stops mixing languages.
- Component tests for tab switching, drill-down, drag reorder and the
  relocated RSVP controls.

### Out of scope

- The guest-facing invitation rendering, which must not change at all.
- The Dashboard, guest list and floor plan (their own tabs, untouched).
- The wax-seal creator's internals — it moves, it does not change.
- A mobile/collapsed panel layout.
- Renaming or restructuring `designData`: this change is presentational, and a
  saved invitation must round-trip byte-identically apart from `defaultFonts`.
