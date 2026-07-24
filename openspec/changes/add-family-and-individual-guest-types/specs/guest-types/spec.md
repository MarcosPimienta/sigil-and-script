# Delta Specification: Guest Types (Individual vs Family)

## Scenario: Creating an Individual Guest
- **WHEN** the host opens the guest creation form and selects `Individual` mode
- **THEN** the form prompts for a primary guest name and optional email
- **AND** creates an `InviteeRecord` with `guestType: 'INDIVIDUAL'`

## Scenario: Creating a Family Household Guest
- **WHEN** the host opens the guest creation form and selects `Family` mode
- **THEN** the form prompts for a Household Family Name (e.g. *"Familia Gómez Pérez"*)
- **AND** allows adding initial family member names directly in the form
- **AND** creates an `InviteeRecord` with `guestType: 'FAMILY'` and populates the dependents list

## Scenario: Title Formatting for Family vs Individual Guests
- **GIVEN** a guest entry with `guestType: 'FAMILY'`
- **WHEN** resolving the invitation title for display or envelope rendering
- **THEN** `formatGuestTitleName` formats the household name appropriately (e.g., *"Familia Gómez Pérez"*)

## Scenario: Roster Persistence
- **WHEN** the host updates guest entries or saves the roster
- **THEN** `guestType` is saved to PostgreSQL and restored upon reloading the dashboard
