# Spec: Invite OpenGraph Link Preview Invitee Name

## Requirement
When a social crawler requests an invitation URL (`/invite/:token`), the generated HTML meta tags MUST contain the personalized invitee name in `og:title` and `<title>`.

### Scenario: Social Crawler fetches invitation preview
- **GIVEN** an invitation token exists for guest "Julian Hernandez" and event "Matrimonio de Marcos & Diana"
- **WHEN** a social crawler (e.g. WhatsApp) requests `/invite/7b7015eb-46a3-4930-a569-77580cff5cd6`
- **THEN** the serverless preview handler fetches guest JSON with `Accept: application/json`
- **AND** returns HTML containing `<title>Invitación para Julian Hernandez al Matrimonio de Marcos & Diana</title>` and matching `og:title`
