# Specification: Per-Guest Language Switch

## Feature: Per-Guest Language Configuration

### Scenario: Toggling invitation language for a guest
- **GIVEN** a host is viewing the Guest Roster in the Creator Studio
- **WHEN** the host clicks the `EN` button on a guest row currently set to `ES`
- **THEN** the guest's language state updates to `EN`
- **AND** any recipient accessing that guest's unique link `/invite/:id` receives the invitation in English.

### Scenario: Resolving invitation language with fallback
- **GIVEN** a guest record without an explicit language preference
- **WHEN** the invitation page is requested at `/invite/:id`
- **THEN** the server falls back to the canvas design's global language setting (`canvas.designData.language`)
- **IF** the design language is also missing, it defaults to `'ES'`.
