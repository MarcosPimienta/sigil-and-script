# Specification: Studio Preview Back Button

**Spec ID:** `studio-preview-back-button`  
**Capability:** HOST tenant → Creator Studio & Recipient Invitation Preview

## Requirements

### Requirement: Persistent Studio Preview Back Button

When a host previews their invitation in recipient mode, a persistent back button SHALL remain accessible to return to the Studio editor at all times, including when the envelope is sealed, during the unsealing animation, and after the invitation letter expands into the full-viewport overlay.

#### Scenario: Back Button in Sealed Preview
- **WHEN** a host clicks "Preview Invitation" from the Studio
- **THEN** a floating button `#btn-preview-back-to-studio` is visible at the top-left of the viewport with `z-index: 10000`
- **AND** the button displays "← Return to Studio" (or "← Volver al Estudio" if language is Spanish).

#### Scenario: Back Button Remains Visible Above Unsealed Invitation Overlay
- **WHEN** the host clicks the wax seal and the invitation expands to `.envelope-letter-viewport-overlay` (`z-index: 9999`)
- **THEN** `#btn-preview-back-to-studio` floats above the open letter overlay without clipping or obstruction.

#### Scenario: Returning to Studio on Click
- **WHEN** the host clicks `#btn-preview-back-to-studio`
- **THEN** the application mode transitions back to `'CREATOR'`
- **AND** the unsealing animation state is reset to `'CLOSED'`
- **AND** preview audio is silenced.

---

### Requirement: Real Guest Privacy Guard

The Studio Preview Back Button SHALL NEVER be visible to real guests accessing an invitation via an invite link.

#### Scenario: Guest Access via Invite Link
- **WHEN** an external guest loads an invitation at `/invite/:token`
- **THEN** `#btn-preview-back-to-studio` is NOT rendered in the DOM.
