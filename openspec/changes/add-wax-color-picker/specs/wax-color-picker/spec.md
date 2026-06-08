## ADDED Requirements

### Requirement: Designer can pick a custom wax color
The system SHALL provide a color picker control in the "Wax Seal Color" panel that allows the designer to select any arbitrary hex color as the wax seal base color.

#### Scenario: Designer opens the color picker
- **WHEN** the designer clicks the custom color picker input in the Wax Seal Color section
- **THEN** the browser's native color picker opens

#### Scenario: Designer picks a custom color
- **WHEN** the designer selects a color from the picker
- **THEN** the wax seal on the canvas updates in real time to reflect the new color
- **THEN** no preset swatch appears selected (active state is cleared)

#### Scenario: Designer switches back to a preset after using the custom picker
- **WHEN** the designer clicks one of the 6 preset swatches
- **THEN** the wax seal updates to the preset color
- **THEN** the preset swatch shows as active
- **THEN** the custom picker input updates to reflect the closest representation of the preset color

---

### Requirement: 3-tone gradient is automatically derived from the picked color
The system SHALL auto-derive `colorLight` (highlight sheen) and `colorSheen` (deep shadow) from the picked hex, so the wax seal retains its 3D appearance for any custom color.

#### Scenario: Picking a mid-hue color
- **WHEN** the designer picks any hex color with an HSL lightness between 10% and 85%
- **THEN** `colorLight` is computed as the same hue/saturation with lightness increased by ~18 percentage points
- **THEN** `colorSheen` is computed as the same hue/saturation with lightness decreased by ~12 percentage points
- **THEN** all three values are dispatched to `UPDATE_WAX_SEAL`

#### Scenario: Clamping for near-white picks
- **WHEN** the designer picks a color with HSL lightness above 85%
- **THEN** `colorLight` is clamped to a maximum lightness of 96%
- **THEN** `colorSheen` is still derived by reducing lightness, ensuring visible gradient contrast

#### Scenario: Clamping for near-black picks
- **WHEN** the designer picks a color with HSL lightness below 10%
- **THEN** `colorSheen` is clamped to a minimum lightness of 3%
- **THEN** `colorLight` is still derived by increasing lightness, ensuring visible gradient contrast

---

### Requirement: Low-contrast warning when custom color is too close to the paper
The system SHALL display an inline warning below the color picker when the picked wax color has insufficient contrast against the current paper background.

#### Scenario: Low-contrast color picked on light paper
- **WHEN** the designer picks a very light color (e.g. near-white) while the paper luminance is `LIGHT`
- **THEN** a warning message is shown beneath the picker: "Low contrast — seal may not be visible on this paper."
- **THEN** the color selection is NOT blocked; the designer can proceed

#### Scenario: Good-contrast color picked
- **WHEN** the designer picks a color with sufficient contrast against the current paper
- **THEN** no warning is shown

#### Scenario: Warning clears when paper texture changes
- **WHEN** the designer changes paper texture and the contrast becomes sufficient
- **THEN** the warning disappears automatically

---

### Requirement: Custom color picker is accessible
The system SHALL ensure the color picker control is fully accessible.

#### Scenario: Keyboard navigation to the picker
- **WHEN** the designer tabs to the color picker input
- **THEN** the input receives focus and is visually indicated
- **THEN** pressing Enter or Space opens the browser color picker

#### Scenario: Screen reader label
- **WHEN** a screen reader encounters the color picker
- **THEN** it announces "Custom wax color" (via a visible `<label>` or `aria-label`)
