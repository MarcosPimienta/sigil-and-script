## 0. Setup and Verification
- [x] 0.1 Confirm that both frontend unit tests and backend tests pass cleanly
- [x] 0.2 Check that the backend server is running locally on port 5001

## 1. Client API Fetch Utility
- [x] 1.1 Create client-side HTTP helper `src/utils/api.ts`
- [x] 1.2 Implement automatic header configuration appending `X-Role` headers depending on route parameters
- [x] 1.3 Configure baseURL pointing to local server instance (`http://localhost:5001`)

## 2. Global Context Extensions
- [x] 2.1 Add api status indicators (`'idle' | 'loading' | 'success' | 'error'`) and error properties to state schema in `src/types/sigil.types.ts`
- [x] 2.2 Add actions `FETCH_INVITATION_START`, `FETCH_INVITATION_SUCCESS`, `FETCH_INVITATION_FAILURE` to reducer
- [x] 2.3 Implement async creator action `fetchInvitationDetails(token: string)` in `src/context/SigilContext.tsx` query validation backend endpoint

## 3. Path Router Parsing
- [x] 3.1 Refactor mount loader in `src/App.tsx` matching pathname routes `/invite/:token` via regex checks
- [x] 3.2 If route matches:
  - Transition application state to `RECIPIENT` mode
  - Execute dynamic hydration fetch tracking telemetry
- [x] 3.3 Add visual overlay/spinner rendering when loading states are active

## 4. RBAC Header Injections
- [x] 4.1 Update host dashboard queries in `src/components/dashboard/DashboardView.tsx` to supply `'X-Role': 'HOST'` headers
- [x] 4.2 Update canvas layout state synchronization mutations to inject authorization properties

## 5. End-to-End Validation
- [x] 5.1 Run regression tests verifying frontend and backend stability
- [x] 5.2 Assert that dynamic routing resolutions load without throwing errors
