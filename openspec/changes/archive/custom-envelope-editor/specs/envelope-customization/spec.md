# Specification — Custom Envelope Customization in Editor

## Purpose
Allow creators to customize the visual assets representing both the closed and open states of the invitation envelope directly within the Creator Studio editor.

## Requirements & Scenarios

### Requirement 1: Upload Custom Closed Envelope Graphic
The editor must allow creators to upload a custom graphic to represent the closed envelope state.

- **Scenario 1.1: Uploading closed envelope image**
  - **GIVEN** the creator is in the Creator Studio under the "Style" tab in the "Envelope and seal" section
  - **WHEN** the creator uploads an image to the "Closed Envelope" upload slot
  - **THEN** the design state is updated with `envelopeCoverClosedImage`
  - **AND** the canvas closed envelope view displays the uploaded image
  - **AND** transparency in PNG/WebP files is preserved.

- **Scenario 1.2: Clearing custom closed envelope image**
  - **GIVEN** a custom closed envelope image is set
  - **WHEN** the creator clicks the remove/clear button
  - **THEN** `envelopeCoverClosedImage` is reset to `undefined`
  - **AND** the envelope view falls back to `/ClosedEnvelope00.png`.

### Requirement 2: Upload Custom Opened Envelope Graphic
The editor must allow creators to upload a custom graphic to represent the open envelope state behind the invitation paper card.

- **Scenario 2.1: Uploading opened envelope image**
  - **GIVEN** the creator is in the Creator Studio under the "Style" tab
  - **WHEN** the creator uploads an image to the "Opened Envelope" upload slot
  - **THEN** the design state is updated with `envelopeCoverOpenedImage`
  - **AND** when the envelope opens, the opened layer displays the uploaded image.

- **Scenario 2.2: Clearing custom opened envelope image**
  - **GIVEN** a custom opened envelope image is set
  - **WHEN** the creator clicks the remove/clear button
  - **THEN** `envelopeCoverOpenedImage` is reset to `undefined`
  - **AND** the open envelope view falls back to `/OpenedEnvelope00.png`.

### Requirement 3: Backward Compatibility & Social Metadata
Invitations without custom envelope images must look identical to legacy invitations, and social sharing must accurately reflect custom graphics when available.

- **Scenario 3.1: Legacy invitation without custom images**
  - **GIVEN** an invitation without `envelopeCoverClosedImage` or `envelopeCoverOpenedImage`
  - **THEN** the closed envelope renders `/ClosedEnvelope00.png`
  - **AND** the opened envelope renders `/OpenedEnvelope00.png`.

- **Scenario 3.2: Social link preview**
  - **GIVEN** an invitation has a custom `envelopeCoverClosedImage`
  - **WHEN** a preview link is generated for WhatsApp / OpenGraph
  - **THEN** the custom closed envelope image URL is used as the preview image.
