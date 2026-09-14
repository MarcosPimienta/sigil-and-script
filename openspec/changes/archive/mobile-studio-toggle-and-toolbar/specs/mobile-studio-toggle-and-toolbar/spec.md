# Delta Spec: Mobile Creator Studio Toggle & Responsive Toolbar

**Spec ID:** `mobile-studio-toggle-and-toolbar`
**Capability:** HOST tenant → Creator Studio & Navigation Toolbar

## ADDED Requirements

### Requirement: Responsive Mobile Toolbar

The application top toolbar SHALL adapt its layout on viewports < 768px to prevent element wrapping, overlapping text, and horizontal overflow.

#### Scenario: Mobile Toolbar Header Layout (< 768px)
- **WHEN** a host views the Creator Studio on a mobile viewport (e.g., 375px)
- **THEN** `.site-toolbar` does NOT wrap into multiple lines or overlap brand text
- **AND** secondary action buttons (Save Layout, Load Layout, Co-Hosts, Language Switch, Mode Switcher) are housed inside a mobile action menu button (`#btn-mobile-menu`)
- **AND** clicking `#btn-mobile-menu` opens the mobile actions dropdown.

---

### Requirement: Mobile Left Panel Drawer with Toggle

The Creator Studio left editing panel SHALL be toggleable on mobile screens (< 768px), allowing the host to seamlessly switch between full-width design controls and full-width canvas preview.

#### Scenario: Default Mobile Studio View
- **WHEN** a host opens the Creator Studio on a mobile screen (< 768px)
- **THEN** the LeftPanel is closed by default, allowing the invitation canvas preview area to consume 100% of the viewport width
- **AND** a mobile toggle button (`[✏️ Design Controls]`) is accessible to open the panel.

#### Scenario: Opening the Mobile Left Panel
- **WHEN** the host taps the mobile toggle button (`[✏️ Design Controls]`)
- **THEN** the LeftPanel slides in as an off-canvas overlay covering the screen
- **AND** the host can interact with Event, Sections, and Style tabs in full width.

#### Scenario: Closing the Mobile Left Panel
- **WHEN** the host taps the `✕` close button in the panel header, the backdrop scrim, or the toggle button
- **THEN** the LeftPanel smoothly slides out of view
- **AND** the full invitation canvas is revealed without reload.

#### Scenario: Desktop Layout Preservation (>= 768px)
- **WHEN** the host views the Creator Studio on a desktop screen (>= 768px)
- **THEN** the LeftPanel renders as a fixed 340px sidebar side-by-side with the canvas preview without off-canvas drawer transforms.

---

### Requirement: Responsive Floor Plan Header & Actions

The Floor Plan and Table Seating view SHALL adapt on screens < 768px to ensure all management controls remain accessible.

#### Scenario: Mobile Floor Plan Navigation
- **WHEN** a host opens Floor Plan on a mobile screen (< 768px)
- **THEN** the stats bar and action buttons row scroll horizontally with touch momentum
- **AND** all action buttons (Blueprint, Add Table, Unassigned Guests, Manifest, Auto-Seat, Clear, Save) are fully swipeable and reachable without viewport clipping.

---

### Requirement: Responsive Guest Dashboard Table

The Guest Dashboard view SHALL isolate horizontal table overflow on screens < 768px to preserve page layout stability.

#### Scenario: Mobile Guest Roster Inspection
- **WHEN** a host opens Guest Dashboard on a mobile screen (< 768px)
- **THEN** the roster table scrolls horizontally within its dedicated container (`.dashboard-table-container`)
- **AND** the page width, top toolbar, and stats bar remain locked to `100vw` without page-level horizontal blowout.
