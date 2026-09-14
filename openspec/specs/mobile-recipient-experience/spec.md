# Delta Spec: Mobile Recipient Experience & Fluid Envelope

**Spec ID:** `mobile-recipient-experience`
**Capability:** GUEST tenant → Digital Invitation Recipient View

## ADDED Requirements

### Requirement: Fluid Responsive Envelope Sizing

The envelope container SHALL scale fluidly according to the viewport width while preserving its 460:360 aspect ratio down to 320px screen widths.

#### Scenario: Rendering on Compact Mobile Viewports (<= 400px width)
- **WHEN** a guest opens an invitation on a mobile device with a viewport width of 375px
- **THEN** `.envelope-container` renders with `width: min(calc(100vw - 32px), 460px)` and does not exceed the viewport width
- **AND** horizontal window scrollbars are NOT created
- **AND** the envelope flap geometry and centered wax seal maintain their proportional alignment without clipping.

#### Scenario: Rendering on Desktop Viewports (>= 500px width)
- **WHEN** a user views the invitation on a desktop screen
- **THEN** `.envelope-container` renders at its maximum default width of 460px.

---

### Requirement: Viewport-Relative Envelope Opening Slide

The letter sliding animation phase SHALL remain within the visible vertical bounds of the mobile screen.

#### Scenario: Sliding Phase on Mobile Viewports
- **WHEN** the wax seal is cracked and the animation enters `LETTER_SLIDING` / `phase-slideout`
- **THEN** `.envelope-letter` translates upwards using a viewport-relative transform (`translateY(min(-240px, -55%))`)
- **AND** the letter does not shoot beyond the top edge of the browser viewport.

---

### Requirement: Wax Seal Touch Interaction and Haptic Feedback

The wax seal SHALL provide responsive touch press states and trigger physical haptic feedback when tapped on supported mobile devices.

#### Scenario: Tapping the Wax Seal on Mobile
- **WHEN** a guest touches and releases the wax seal button
- **THEN** an active scale down press animation is rendered
- **AND** the system invokes `navigator.vibrate([25, 40, 30])` when supported by the browser
- **AND** the wax seal cracking audio plays and initiates the opening animation sequence.

---

### Requirement: Safe Area Inset Management

Fixed floating controls and bottom scroll containers SHALL respect device safe area insets (notches and home indicators).

#### Scenario: Floating Audio Toggle Positioning
- **WHEN** the floating audio toggle is rendered on a notched device with a home indicator
- **THEN** its bottom and right positions incorporate `var(--safe-bottom)` and `var(--safe-right)` offsets
- **AND** the button does not collide with or get obscured by native system navigation indicators.

#### Scenario: Recipient Scroll Container Bottom Padding
- **WHEN** a guest scrolls to the bottom of the invitation
- **THEN** the container maintains bottom clearance of `calc(2.5rem + var(--safe-bottom, 0px))` so the final RSVP elements and buttons are fully accessible.

---

### Requirement: Ergonomic Mobile RSVP Card

The RSVP form SHALL be decoupled from desktop sidebar styles and provide touch targets of at least 44×44px.

#### Scenario: Rendering the RSVP Card in Recipient Mode
- **WHEN** the RSVP section is rendered in the recipient flow
- **THEN** it renders as `.recipient-rsvp-card` with full fluid width up to 440px
- **AND** it does NOT inherit `.left-panel` desktop sidebar widths, border-rights, or inspector z-indexes.

#### Scenario: Attendance Choice Buttons
- **WHEN** the guest selects attendance ("Yes, gladly" or "No, regrettably")
- **THEN** the buttons have a minimum height of 48px with clear visual feedback for the selected choice.

#### Scenario: Family Dependent Checkbox Selection
- **WHEN** an invitation includes dependent family members
- **THEN** each dependent selection row provides a minimum 44px hit region for effortless toggling on touchscreens.
