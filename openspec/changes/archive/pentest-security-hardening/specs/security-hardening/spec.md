# Spec: Security Hardening & Pentest Remediation

**Spec ID:** `security-hardening`
**Capability:** Security, Authentication, Input Validation, Infrastructure

## Requirements

### Requirement: Authentication Rate Limiting
Public endpoints that handle sensitive authentication credentials and guest responses SHALL enforce rate limiting to prevent brute force and denial of service.

#### Scenario: Excessive failed login attempts
- **WHEN** more than 5 login requests are received from the same client IP within a 15-minute window
- **THEN** the server responds with HTTP 429 (`Too Many Requests`) with a message instructing the client to retry later.

#### Scenario: Registration flood
- **WHEN** more than 10 registration requests are sent from the same client IP within a 15-minute window
- **THEN** the server responds with HTTP 429 (`Too Many Requests`).

#### Scenario: RSVP submission flood
- **WHEN** more than 20 RSVP requests are sent from the same client IP within a 15-minute window
- **THEN** the server responds with HTTP 429 (`Too Many Requests`).

---

### Requirement: Anti-Enumeration on User Registration
The registration endpoint SHALL NOT disclose whether an email address is already associated with an existing account.

#### Scenario: New user registration
- **WHEN** a client submits a registration request with an unused email and valid password
- **THEN** the server creates the user record and responds with HTTP 201 `{ success: true, message: "..." }`.

#### Scenario: Existing email registration
- **WHEN** a client submits a registration request with an email that is already registered
- **THEN** the server does NOT create a duplicate, does NOT overwrite existing credentials, and responds with the same success structure `{ success: true, message: "..." }` without disclosing account existence.

---

### Requirement: Minimum Password Security Policy
All user passwords submitted during registration or password reset SHALL adhere to modern baseline strength standards (NIST SP 800-63B).

#### Scenario: Password shorter than 12 characters
- **WHEN** a user attempts to register or reset their password with fewer than 12 characters
- **THEN** the server rejects the request with HTTP 400 and an error message stating that passwords must be at least 12 characters long.

#### Scenario: Trivial or commonly breached password
- **WHEN** a user submits a password present on the common weak password list (e.g. `weakpw123456`, `password1234`)
- **THEN** the server rejects the request with HTTP 400 and an error indicating the password is too common or easily guessable.

---

### Requirement: Media Upload & Storage Protection
The media upload endpoint SHALL strictly restrict destinations to allowed buckets and neutralize executable or malicious payload formats.

#### Scenario: Upload with unapproved bucket
- **WHEN** an authenticated user calls `POST /upload/media` with a bucket not in `['invitation-images', 'invitation-music']`
- **THEN** the server rejects the request with HTTP 400 (`Invalid storage bucket target`) before dispatching any request to Supabase.

#### Scenario: Upload with malicious active SVG
- **WHEN** an SVG containing active script tags (`<script>`, `<foreignObject>`, or `onload`/`onerror` attributes) is submitted
- **THEN** the server sanitizes the SVG content to strip all executable logic, or rejects the upload with HTTP 400 if active content cannot be safely neutralized.

#### Scenario: Buffer type spoofing
- **WHEN** a file declared as an image fails to match expected magic-byte signatures
- **THEN** the server rejects the payload with HTTP 400 (`File header signature does not match declared type`).

---

### Requirement: RSVP Input Sanitization
Free-text fields submitted by unauthenticated guests during RSVP SHALL be sanitized to neutralize stored cross-site scripting vectors.

#### Scenario: Submission with HTML tags in notes or dietary fields
- **WHEN** an attendee submits `<script>`, `<img>`, or `<svg>` markup inside `notes`, `dietary`, or `mealPref`
- **THEN** the server strips or encodes the markup before persisting it into `formResponses`, storing only sanitized plain text.

#### Scenario: Excessively long text input
- **WHEN** a field exceeds 500 characters
- **THEN** the server rejects the payload with HTTP 400.

---

### Requirement: Information Disclosure and HTTP Security Headers
The web application and API SHALL include hardened HTTP response headers and refrain from leaking server technology banners or raw database errors.

#### Scenario: Server banner suppression
- **WHEN** any HTTP request is made to the API backend
- **THEN** the `X-Powered-By` header is not present in the response headers.

#### Scenario: Storage failure error redaction
- **WHEN** Supabase storage fails or returns an internal error code
- **THEN** the backend logs the internal error to the server console and responds to the client with a generic message (`Failed to upload media file`), omitting internal keys, codes, and JSON fragments.

#### Scenario: Frontend framing restriction
- **WHEN** the frontend web application is loaded in a browser
- **THEN** the server returns `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff`.

---

### Requirement: Token-Based Authorization & Mass Assignment Guard
API authorization SHALL derive exclusively from verified bearer session tokens, and resource ownership SHALL be assigned server-side.

#### Scenario: Client sending arbitrary `X-Role`
- **WHEN** a client transmits `X-Role: ADMIN` or `X-Role: HOST`
- **THEN** the server ignores the header and determines authorization strictly from the session token in the `Authorization` header.

#### Scenario: Canvas creation with client-supplied `id` or `hostId`
- **WHEN** a client calls `POST /canvas` containing `id` or `hostId` in the body
- **THEN** the server assigns a new server-generated UUID for `id`, binds `hostId` to `req.user.id`, and ignores the client-provided values.
