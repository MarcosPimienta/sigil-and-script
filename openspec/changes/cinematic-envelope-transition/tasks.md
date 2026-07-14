## 1. CSS Keyframes and Classes
- [x] 1.1 Declare paper letter styling, slide-out transformations, and viewport overlays in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css#L1250).

## 2. Refactor Left Panel Upload label
- [x] 2.1 Rename the polaroid input label to "Event Logo Image" inside [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx#L236).

## 3. Implement Envelope Wrapper Sequence
- [x] 3.1 Expand animation phases and implement sequential timeout handlers inside [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx#L7).
- [x] 3.2 Implement the textured paper letter layout with decorative borders and text placeholders inside the envelope.

## 4. Integrate Canvas Logo and Fading Dispatcher
- [x] 4.1 Update [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx#L17) to manage the expanded animation phases, control container overflow, and fade sections in.
- [x] 4.2 Render the couple photo/logo at the top of the details sections as a premium event monogram logo.

## 5. Verification
- [x] 5.1 Run all unit tests using `npm test`.
- [x] 5.2 Compile the production bundle using `npm run build`.
