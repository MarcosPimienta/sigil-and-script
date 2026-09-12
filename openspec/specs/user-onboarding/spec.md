# Specification: User Registration & Onboarding Funnel

## Purpose
Provide a welcoming, friction-free public acquisition and onboarding flow for new event hosts.

## Scenarios

### 1. Unauthenticated Visitor Experience
- **GIVEN** a visitor navigates to the application root `/` without an active session
- **WHEN** no special query parameters are present
- **THEN** the system displays the `LandingHero` page showcasing sample templates, features, and typography
- **AND** displays clear calls-to-action: "Start Designing" and "Sign In".

### 2. Direct Auth Route Navigation
- **GIVEN** an unauthenticated visitor navigates to `/?auth=register` or `/?auth=login`
- **WHEN** the page loads
- **THEN** the system immediately opens the Onboarding Wizard or Login form respectively
- **AND** cleans up the query string without reloading.

### 3. Guided 3-Step Host Onboarding
- **GIVEN** a prospective host opens the `OnboardingWizard`
- **WHEN** the host enters full name, valid email, and password $\ge 12$ characters in Step 1
- **THEN** client validation verifies password length and matching confirmation
- **AND** clicking "Next" sends `POST /auth/register` and establishes an authenticated session.

### 4. Template & Event Initialization
- **GIVEN** the newly registered host completes Step 1
- **WHEN** they choose an event type (e.g. `WEDDING` or `CORPORATE`) and language in Step 2, and enter their event title and date in Step 3
- **THEN** the client generates the template canvas with default phrasing and chosen title
- **AND** saves the canvas to `POST /canvas` with the host's `userId`
- **AND** navigates the user directly to `CreatorCanvas` (`appMode: 'CREATOR'`).
