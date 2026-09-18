# Specification — QR Tab & Physical Printable Invitation Cards

## Purpose
Enable event creators to design, preview, and print physical invitation cards containing personalized QR codes that lead directly to each guest's digital invitation and RSVP experience.

## Requirements & Scenarios

### Requirement 1: QR Tab in Studio Editor
The Studio editor must provide a dedicated `QR` tab where creators can configure the appearance and content of physical printable QR cards.

- **Scenario 1.1: Navigating to QR Tab**
  - **GIVEN** the creator is in Creator Studio
  - **WHEN** the creator clicks the "QR" tab in the left panel
  - **THEN** the left panel switches to the `QR` configuration tab
  - **AND** the main canvas area displays a live, interactive preview of the physical printable card.

- **Scenario 1.2: Customizing Card Layout & Dimensions**
  - **GIVEN** the creator is on the QR tab
  - **WHEN** the creator selects a card size (e.g. 4×6", 3.5×2", A6, Square) or theme (Parchment, Minimal White, Modern Dark)
  - **THEN** the canvas preview immediately adjusts its aspect ratio, typography, and styling to match.

- **Scenario 1.3: Customizing Copy & Personalization Toggles**
  - **GIVEN** the creator is on the QR tab
  - **WHEN** the creator edits the headline, scan instructions, or toggles guest name display
  - **THEN** the card preview updates dynamically.

### Requirement 2: QR Code Generation
The system must generate scannable vector SVG and canvas QR codes with high error tolerance.

- **Scenario 2.1: Scannable QR generation**
  - **GIVEN** an invitation URL
  - **WHEN** the QR card is rendered
  - **THEN** a valid ISO/IEC 18004 QR code is generated matching the target URL
  - **AND** when the guest name toggle is enabled, the sample preview shows a placeholder name.

- **Scenario 2.2: Center Seal / Logo overlay**
  - **GIVEN** the creator enables "Include Wax Seal in QR Center"
  - **WHEN** the QR code renders
  - **THEN** the QR generator switches to Error Correction Level H
  - **AND** the seal/monogram is neatly centered with a quiet zone ring without preventing scanner recognition.

### Requirement 3: Per-Guest QR Card Modal in Roster
Hosts must be able to view, print, and download the personalized QR card for any guest directly from the guest roster.

- **Scenario 3.1: Launching QR card from Dashboard Roster**
  - **GIVEN** the host is viewing the guest list in the Dashboard
  - **WHEN** the host clicks the "QR" button next to "Copy link"
  - **THEN** a pop-up modal opens displaying that guest's personalized QR card with their unique link (`/invite/:id`) and guest name.

- **Scenario 3.2: Launching QR card from Sidebar Roster**
  - **GIVEN** the host is viewing the sidebar guest list
  - **WHEN** the host clicks the "QR" button next to "📋 Link"
  - **THEN** the same modal opens populated with that guest's data.

- **Scenario 3.3: Printing and Downloading**
  - **GIVEN** the QR card modal is open
  - **WHEN** the host clicks "Print Card"
  - **THEN** the browser print dialogue opens formatted specifically for the card dimensions without page chrome.
  - **WHEN** the host clicks "Download PNG"
  - **THEN** a high-resolution 300 DPI image file is generated and downloaded.
