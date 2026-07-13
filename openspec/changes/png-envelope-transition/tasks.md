## 1. Asset Instructions
- [ ] 1.1 Document and guide the user to place their PNG files (`ClosedEnvelope00.png` and `OpenedEnvelope00.png`) in `public/`.

## 2. Refactor EnvelopeWrapper Component
- [ ] 2.1 Modify [src/components/creator/EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx) to remove CSS flap markup.
- [ ] 2.2 Add absolute-positioned stacked image elements referencing `/ClosedEnvelope00.png` and `/OpenedEnvelope00.png`.
- [ ] 2.3 Align the interactive wax seal button on top of the closed envelope image.
- [ ] 2.4 Implement couple's photo and title header transitions that fade in and slide up when `phase` transitions to `OPENING` or `SLIDEOUT`.

## 3. Update Creator Canvas Layout
- [ ] 3.1 Adapt [src/components/creator/CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx) to utilize the unified envelope cover, displaying the date at the top and the music play CTA below.

## 4. Add Styles in Stylesheet
- [ ] 4.1 Define the styling properties in [src/styles/creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) for the envelope image layers, title animations, and the couple photo frame.

## 5. Verification
- [ ] 5.1 Run `npm run test` to verify that unit tests pass successfully.
- [ ] 5.2 Run `npm run build` to verify that the application compiles without errors.
