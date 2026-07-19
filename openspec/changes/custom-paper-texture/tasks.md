# Tasks for Custom Paper Texture

- [x] **1. Studio UI Updates (`LeftPanel.tsx`)**
  - [x] 1.1 Find the Custom Artwork section in `LeftPanel.tsx`.
  - [x] 1.2 Add a new `ImageUploadSlot` for `paperImage` labeled "Textura de Papel" or "Background Texture".
- [x] **2. Canvas Rendering (`InvitationStage.tsx`)**
  - [x] 2.1 Destructure `paperImage` from `design`.
  - [x] 2.2 In the `.stage-grain-overlay` element (or a newly created overlay sibling), conditionally apply the `backgroundImage` if `paperImage` exists.
  - [x] 2.3 Set `backgroundRepeat: 'repeat'`, `backgroundSize: 'auto'`, and `mixBlendMode: 'multiply'` on the overlay to achieve the realistic parchment effect.
- [x] **3. Verification**
  - [x] 3.1 Build and deploy the changes.
  - [x] 3.2 Verify that uploading a texture correctly tiles it across the entire height of the invitation.
