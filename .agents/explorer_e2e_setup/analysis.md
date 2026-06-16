# Codebase Exploration & E2E Test Suite Design Report

## Executive Summary
This report documents the architectural exploration of the **Padelitycs** codebase regarding Supabase, Docker, and database schemas. It also presents a comprehensive design of **60 End-to-End (E2E) test cases** spanning four tiers (Feature Coverage, Boundary/Corner Cases, Cross-Feature Combinations, and Real-World Scenarios) to validate the "Padel-Cash" gamification and payment validation features.

---

## 1. Codebase State & Architectural Findings

We conducted a thorough search and audit of the repository files. Here are the key findings:

### A. Local Supabase & Docker Configurations
*   **Status**: **Not present.** There is no active local Supabase configuration, no `supabase` directory, and no Docker configuration (`docker-compose.yml`, `Dockerfile`, etc.) in the root or subfolders.
*   **Roadmap Context**: According to `PROJECT.md`, the project is in **Milestone 2 (Supabase Backend Setup)**, marked as "IN_PROGRESS". The frontend is currently running as a client-side Single Page Application utilizing simulated local state.

### B. TypeScript Schema / Client Files
*   **Status**: **Not present for Supabase.** There are no database client files (e.g. `@supabase/supabase-js` clients) or auto-generated TypeScript schemas.
*   **Local Client Schema**: The types defining the domain model for the current simulation are located in:
    *   `src/types/padelCashTypes.ts` (defining `PadelCashCoupon`, `PadelUserLevel`, `PadelCashUser`, `YapeBookingDetails`, `YapePaymentRequest`, and `PadelCashResponse`).
    *   `src/context/TournamentContext.tsx` (defining `RegisteredPair`, `RegisteredPlayer`, `Tournament`, and the main context provider state).

### C. Current State & Sincronización (Real-Time Mocking)
*   **Mock State**: States like `padelCashUsers` and `yapePayments` are initialized with mock data on mount and synced with `localStorage` (via keys `padelitycs_cash_users` and `padelitycs_yape_payments`).
*   **Real-Time Tab Sync**: Sincronización is implemented natively in `TournamentContext.tsx` utilizing the HTML5 `storage` event. When an action is taken by the Admin in one tab, the player portal tab updates immediately without page reloads.

---

## 2. 60 E2E Test Cases Across 4 Tiers

Here is the complete catalog of 60 E2E test cases designed to guide the upcoming implementation and migration phase.

### Tier 1: Feature Coverage (25 Test Cases)
This tier covers positive paths for the 5 core functionalities, with 5 test cases per feature.

#### Feature 1: Email Login
*   **TC-T1-LOGIN-01: Successful Administrator Login**
    *   *Preconditions*: Admin credentials exist in mock/database (e.g., email `admin@club.com`, password `admin`).
    *   *Steps*: Navigate to Admin Login (`/admin-login`), input valid email and password, click "Ingresar al Panel".
    *   *Expected Result*: Redirected to `/admin-dashboard` showing admin metrics.
*   **TC-T1-LOGIN-02: User Login with Valid Format**
    *   *Preconditions*: User exists.
    *   *Steps*: Input user email and password on login modal, submit.
    *   *Expected Result*: Session established, login modal closes, user navbar shows profile name.
*   **TC-T1-LOGIN-03: Invalid Password Rejection**
    *   *Preconditions*: Account exists.
    *   *Steps*: Input valid email, input incorrect password, click submit.
    *   *Expected Result*: Inline error message appears: "Por favor, ingresa correo y contraseña." or invalid credentials message; no session created.
*   **TC-T1-LOGIN-04: Non-existent Account Attempt**
    *   *Preconditions*: Email is not registered.
    *   *Steps*: Input non-existent email, input any password, submit.
    *   *Expected Result*: System rejects credentials with appropriate error message.
*   **TC-T1-LOGIN-05: Session Persistence on Page Reload**
    *   *Preconditions*: Session is active.
    *   *Steps*: Reload the browser window.
    *   *Expected Result*: Session remains active (no logout occurs); user is still authenticated.

#### Feature 2: Role Routing
*   **TC-T1-ROUTE-01: Admin Access Redirection**
    *   *Preconditions*: Authenticated user has "admin" role.
    *   *Steps*: Navigate to root path or `/admin-dashboard`.
    *   *Expected Result*: Route resolves to the Admin Dashboard (views like `AcademyMatrixView` or `PadelCashAdminView` are visible).
*   **TC-T1-ROUTE-02: Guest Access Restriction**
    *   *Preconditions*: Guest user (unauthenticated).
    *   *Steps*: Attempt to navigate directly to `/admin-dashboard`.
    *   *Expected Result*: Redirected to `/admin-login` or root page; access denied.
*   **TC-T1-ROUTE-03: Client Routing to Padel-Cash Portal**
    *   *Preconditions*: Authenticated user has "client" role.
    *   *Steps*: Navigate to root or click "Padel-Cash" in navbar.
    *   *Expected Result*: Routed to `PadelCashPortal` containing loyalty stats and booking simulator.
*   **TC-T1-ROUTE-04: Role Switch Simulation (Dropdown)**
    *   *Preconditions*: On the Padel-Cash Portal.
    *   *Steps*: Select different user profiles (Carlos Díaz vs Roberto Gómez) from the simulation bar.
    *   *Expected Result*: Portal content (points, coupons, levels) updates immediately reflecting the selected user.
*   **TC-T1-ROUTE-05: Secure Logout Redirect**
    *   *Preconditions*: Authenticated user.
    *   *Steps*: Click "Logout" or "Volver al inicio".
    *   *Expected Result*: Session cleared from local/Supabase storage, views reset, redirected back to Home.

#### Feature 3: Yape Booking Request
*   **TC-T1-YAPE-01: Prepago Discount Selection**
    *   *Preconditions*: User is in booking simulator.
    *   *Steps*: Select court, date, time slot, select "Pago Anticipado (Yape)".
    *   *Expected Result*: Displayed price shows a 10% discount relative to the base price (S/ 72.00 vs S/ 80.00).
*   **TC-T1-YAPE-02: Demo Screenshot Generation**
    *   *Preconditions*: User filling booking simulator.
    *   *Steps*: Click "Generar comprobante" button.
    *   *Expected Result*: Visual image file gets generated/uploaded (showing canvas with Yape branding, correct amount, operation code, and client name).
*   **TC-T1-YAPE-03: Booking Request Submission**
    *   *Preconditions*: Court details selected, mock receipt uploaded.
    *   *Steps*: Click "Confirmar y Subir Reserva".
    *   *Expected Result*: Booking successfully submitted, simulator state resets, user redirected to "Mis Comprobantes".
*   **TC-T1-YAPE-04: Pending Status Verification**
    *   *Preconditions*: Booking just submitted.
    *   *Steps*: Inspect "Mis Comprobantes" tab.
    *   *Expected Result*: The submitted request appears at the top of the list with status set to "Pendiente" (orange badge).
*   **TC-T1-YAPE-05: Receipt Details Verification**
    *   *Preconditions*: Request is in user history.
    *   *Steps*: Inspect fields on history item.
    *   *Expected Result*: Shows correct court name, date, time slot, discounted price, and original price (struck through).

#### Feature 4: Admin Approval
*   **TC-T1-APPROVAL-01: Queue Population**
    *   *Preconditions*: User has submitted a pending booking request.
    *   *Steps*: Access Admin Dashboard -> Gestor Padel-Cash -> "Cola de Pagos".
    *   *Expected Result*: The submitted request appears in the list showing correct user name, amount, and slot.
*   **TC-T1-APPROVAL-02: Auditoría Visual Preview**
    *   *Preconditions*: Admin is in "Cola de Pagos".
    *   *Steps*: Click on a pending payment request from the list.
    *   *Expected Result*: The detail pane opens on the right displaying the uploaded Yape screenshot, client info, and expected amount.
*   **TC-T1-APPROVAL-03: Validation Approval Workflow**
    *   *Preconditions*: A pending payment is selected.
    *   *Steps*: Click "Validar Pago".
    *   *Expected Result*: Payment disappears from pending queue, status changes to "approved", points/levels are updated.
*   **TC-T1-APPROVAL-04: Validation Rejection Workflow**
    *   *Preconditions*: A pending payment is selected.
    *   *Steps*: Click "Fraude / Error", enter rejection reason, click "Confirmar Rechazo".
    *   *Expected Result*: Payment request transitions to "rejected" with rejection reason appended.
*   **TC-T1-APPROVAL-05: Manual Points Adjustment**
    *   *Preconditions*: Admin is in "Base de Socios".
    *   *Steps*: Select user (e.g. Carlos Díaz), click "Ajustar PTS", enter "+20", submit.
    *   *Expected Result*: User points balance increases by 20 instantly.

#### Feature 5: Coupon Management
*   **TC-T1-COUPON-01: Claim Coupon Enablement**
    *   *Preconditions*: User has >= 100 points.
    *   *Steps*: Go to Padel-Cash Portal -> "Mi Fidelidad".
    *   *Expected Result*: "Canjear Cupón de S/ 50 (100 PTS)" button is active.
*   **TC-T1-COUPON-02: Coupon Generation & Deduct Points**
    *   *Preconditions*: User has 120 points.
    *   *Steps*: Click "Canjear Cupón de S/ 50 (100 PTS)".
    *   *Expected Result*: User points balance drops to 20, a coupon code (e.g. `CUP-XXXX`) is added to "Mis Cupones".
*   **TC-T1-COUPON-03: Claim Coupon Disablement**
    *   *Preconditions*: User has < 100 points (e.g., 40 points).
    *   *Steps*: Inspect "Mi Fidelidad" page.
    *   *Expected Result*: "Canjear Cupón" button is disabled/inactive.
*   **TC-T1-COUPON-04: Coupon Selection in Simulator**
    *   *Preconditions*: User has an unused discount coupon.
    *   *Steps*: Open Booking Simulator, click "Aplicar Cupón" dropdown.
    *   *Expected Result*: The unused coupon code is selectable.
*   **TC-T1-COUPON-05: Booking Price Discount Calculation**
    *   *Preconditions*: Court selection active (discounted price S/ 72.00).
    *   *Steps*: Select and apply S/ 50 coupon.
    *   *Expected Result*: Total to pay in Summary decreases dynamically to S/ 22.00.

---

### Tier 2: Boundary & Corner Cases (25 Test Cases)
This tier covers negative paths, validation constraints, security policies, and boundary conditions.

#### Scenario A: Empty Fields
*   **TC-T2-EMPTY-01: Empty Login Submit**
    *   *Steps*: Leave email and password blank, click "Ingresar al Panel".
    *   *Expected Result*: Submission blocked; error displayed: "Por favor, ingresa correo y contraseña."
*   **TC-T2-EMPTY-02: Missing Screenshot on Booking Submit**
    *   *Steps*: Select court and slot, do not click "Generar comprobante", try to click submit.
    *   *Expected Result*: Submission button is disabled (`disabled={!yapeFileMock}`); submission is prevented.
*   **TC-T2-EMPTY-03: Empty Rejection Reason**
    *   *Steps*: Click "Fraude / Error" on admin detail pane, submit dialog with empty/whitespace input.
    *   *Expected Result*: Submission blocked; HTML5 inline validation forces input (`required`).
*   **TC-T2-EMPTY-04: Empty Manual Points Input**
    *   *Steps*: Click "Ajustar PTS" in Base de Socios, delete default value, submit.
    *   *Expected Result*: Submission is blocked or defaults to 0; no points modification.
*   **TC-T2-EMPTY-05: Empty Onboarding Fields**
    *   *Steps*: Start registration/onboarding wizard, leave fields empty, click "Next".
    *   *Expected Result*: Navigation blocked, validation error messages appear for required fields.

#### Scenario B: Invalid Emails
*   **TC-T2-EMAIL-01: Invalid Email Format in Login**
    *   *Steps*: Type `invalidemail.com` in email field, enter password, submit.
    *   *Expected Result*: Form validation blocks submit or email input field flags format error.
*   **TC-T2-EMAIL-02: Missing Domain Extension**
    *   *Steps*: Type `admin@club` in email, enter password, submit.
    *   *Expected Result*: Blocked by browser email validation or local form validator.
*   **TC-T2-EMAIL-03: Special Characters Injection Attempt**
    *   *Steps*: Input `' OR 1=1 --` or `<script>` in email field, attempt login.
    *   *Expected Result*: Input sanitized or rejected safely; auth process fails gracefully without crashing.
*   **TC-T2-EMAIL-04: Excessively Long Email Input**
    *   *Steps*: Paste a 300-character email address, submit.
    *   *Expected Result*: Handled gracefully; input constrained by `maxlength` or backend returns validation error.
*   **TC-T2-EMAIL-05: Case Sensitivity Handling**
    *   *Steps*: Login using `ADMIN@CLUB.COM` instead of `admin@club.com`.
    *   *Expected Result*: Authentication succeeds; system normalizes email to lowercase.

#### Scenario C: Negative Points
*   **TC-T2-POINTS-01: Cancellation Points Deduction Floor**
    *   *Preconditions*: User has 5 points and 1 completed reservation.
    *   *Steps*: User cancels their only approved booking (triggering -10 points penalty).
    *   *Expected Result*: Points balance drops to 0, not -5. Points field capped at 0 (`Math.max(0, user.points - 10)`).
*   **TC-T2-POINTS-02: Admin Manual Points Reduction Floor**
    *   *Preconditions*: User has 15 points.
    *   *Steps*: Admin manually adjusts points by inputting `-50`.
    *   *Expected Result*: User points balance drops to 0; negative balance is prevented.
*   **TC-T2-POINTS-03: Multiple Cancellations Points Check**
    *   *Preconditions*: User has 0 points.
    *   *Steps*: Cancel two approved bookings in succession.
    *   *Expected Result*: Points balance remains 0; no underflow.
*   **TC-T2-POINTS-04: Coupon Claim Points Boundary (99 PTS)**
    *   *Preconditions*: User has exactly 99 points.
    *   *Steps*: Attempt to claim S/ 50 coupon.
    *   *Expected Result*: Button remains disabled; request is blocked.
*   **TC-T2-POINTS-05: Supabase DB Constraint Verification**
    *   *Steps*: Execute a direct DB insertion/update attempting to set `profiles.points` to `-1`.
    *   *Expected Result*: Database rejects query due to `CHECK (points >= 0)` constraint.

#### Scenario D: Unauthorized RLS Updates
*   **TC-T2-RLS-01: Guest Booking Request Insertion**
    *   *Steps*: Send direct SQL insert or REST request to `reservations` table without auth token.
    *   *Expected Result*: Rejected with `401 Unauthorized` / RLS Policy violation.
*   **TC-T2-RLS-02: User Tampering with Points**
    *   *Steps*: Authenticate as user, send update payload to change own `points` or `role` in `profiles`.
    *   *Expected Result*: Rejected; RLS policies only allow update of non-sensitive columns, or forbid user update entirely.
*   **TC-T2-RLS-03: User Approving Own Payment**
    *   *Steps*: Authenticate as user, send update request to `yape_payments` setting status to `approved`.
    *   *Expected Result*: Rejected; RLS policy restricts `update` on `yape_payments` status to admin role only.
*   **TC-T2-RLS-04: Reading Peer Payment Requests**
    *   *Steps*: Authenticate as Client A, request payment records of Client B.
    *   *Expected Result*: Returns 0 rows; RLS policy restricts visibility: `user_id = auth.uid()`.
*   **TC-T2-RLS-05: Non-Admin Manual Points Adjustment API**
    *   *Steps*: Non-admin user calls the API endpoint/RPC used for manual points adjustments.
    *   *Expected Result*: Forbidden; server-side/RPC verification confirms caller is admin.

#### Scenario E: Invalid Payment Status Transitions
*   **TC-T2-TRANS-01: Re-approving Approved Payment**
    *   *Preconditions*: Payment request is already "approved".
    *   *Steps*: Send an approval action for the same payment ID.
    *   *Expected Result*: Blocked; state transition from `approved` to `approved` is rejected.
*   **TC-T2-TRANS-02: Rejecting Approved Payment**
    *   *Preconditions*: Payment request is "approved".
    *   *Steps*: Attempt to trigger reject action.
    *   *Expected Result*: Blocked (cannot reject after approval; cancellation flow must be used instead).
*   **TC-T2-TRANS-03: Approving Rejected Payment**
    *   *Preconditions*: Payment request is "rejected".
    *   *Steps*: Attempt to trigger approval action.
    *   *Expected Result*: Blocked; state transition from `rejected` to `approved` is denied.
*   **TC-T2-TRANS-04: Cancelling Pending Payment Booking**
    *   *Preconditions*: Payment request is "pending".
    *   *Steps*: Locate booking, click cancel.
    *   *Expected Result*: Cancel option is disabled or does not generate coupon refunds, as money has not been approved/received.
*   **TC-T2-TRANS-05: Cancelling Canceled/Refunded Booking**
    *   *Preconditions*: Booking status is already canceled/refunded.
    *   *Steps*: Try to trigger cancel action again.
    *   *Expected Result*: Blocked; action is unavailable.

---

### Tier 3: Cross-Feature Combinations (5 Test Cases)
This tier tests the integration points and state synchronization across multiple features.

*   **TC-T3-COMB-01: Approval Chain Reaction (Payment + Points + Level)**
    *   *Preconditions*: User Carlos Díaz has 9 completed reservations, 40 points, level Bronce.
    *   *Steps*:
        1. Carlos submits a Yape booking (original S/ 80, discounted S/ 72).
        2. Admin approves the booking request.
    *   *Expected Result*:
        1. Payment request status becomes "approved".
        2. Carlos' completed reservations count increments to 10.
        3. Carlos' level automatically upgrades to "plata".
        4. Carlos' points balance increases to 50.
*   **TC-T3-COMB-02: Coupon Redemption and Booking Consumption**
    *   *Preconditions*: User has 100 points, level Bronce.
    *   *Steps*:
        1. User claims points coupon -> receives code `CUP-ABCD` (points drop to 0).
        2. User opens booking simulator, selects `CUP-ABCD` coupon.
        3. User uploads receipt and confirms booking.
    *   *Expected Result*:
        1. Total paid is calculated as S/ 22.00 (80 - 10% = 72; 72 - 50 = 22).
        2. Coupon code `CUP-ABCD` is marked as `isUsed: true` immediately.
        3. Coupon is removed from the selector dropdown.
*   **TC-T3-COMB-03: Booking Cancellation and Refund Loop**
    *   *Preconditions*: User has 50 points, 10 completed reservations, level Plata. User has an approved booking (discounted price S/ 68.40).
    *   *Steps*:
        1. User goes to "Mis Comprobantes", selects approved booking, clicks "Cancelar".
    *   *Expected Result*:
        1. Booking status is set to "rejected/canceled".
        2. Completed reservations decrements to 9.
        3. User level is downgraded back to Bronce.
        4. User points decremented by 10 (drops to 40).
        5. A new virtual credit coupon of value S/ 68.40 (`CRED-XXXX`) is added to the user's profile with `isUsed: false`.
*   **TC-T3-COMB-04: Compounded Discounts (Anticipated + Level + Coupon)**
    *   *Preconditions*: User is Oro (10% discount). User has an active S/ 50 coupon.
    *   *Steps*:
        1. User goes to Booking Simulator.
        2. Selects "Pago Anticipado (Yape)" (-10%).
        3. Selects the S/ 50 coupon.
    *   *Expected Result*:
        1. Base Price: S/ 80.00.
        2. Prepago Price: S/ 72.00.
        3. Level Discount: -10% of 72 = -S/ 7.20 (Subtotal: S/ 64.80).
        4. Coupon Discount: -S/ 50.00.
        5. Final Price: S/ 14.80.
*   **TC-T3-COMB-05: Real-Time Tab Synchronization**
    *   *Preconditions*: Player Portal is open in Tab A. Admin View is open in Tab B.
    *   *Steps*:
        1. Tab A: Submit a new Yape booking.
        2. Tab B: Check pending queue (request appears). Click "Validar Pago".
        3. Tab A: Inspect points balance and history without refreshing the page.
    *   *Expected Result*: Tab A updates points (+10), level (if threshold crossed), and history status (Approved) instantly upon Tab B approval action, powered by HTML5 storage sync.

---

### Tier 4: Real-World Application Scenarios (5 Test Cases)
This tier tests complex, multi-user, and sequential operations simulating actual club usage.

*   **TC-T4-SCEN-01: The Loyalty Cycle (From Registration to Discounted Purchase)**
    *   *Steps*:
        1. A new user registers via the onboarding wizard.
        2. User enters Padel-Cash Portal (starts at 0 reservations, 0 points, level Bronce).
        3. User books a court, pays via Yape (price: S/ 72.00), uploads screenshot and submits.
        4. Admin logs in, reviews payment queue, and clicks "Validar Pago".
        5. User reviews profile: has 10 points, 1 completed reservation.
        6. Admin adjusts points manually by +90 (simulating reward for tournament participation). User points balance becomes 100.
        7. User clicks "Canjear Cupón de S/ 50". Points drop to 0; coupon code `CUP-LOYAL` is generated.
        8. User makes another booking, applies `CUP-LOYAL`. Final price becomes S/ 22.00.
        9. User uploads screenshot of S/ 22.00, submits, and admin approves.
    *   *Expected Result*: User has 10 points, 2 completed reservations, and has successfully executed the full discount lifecycle.
*   **TC-T4-SCEN-02: The Refund and Re-booking Scenario**
    *   *Steps*:
        1. Carlos Díaz (level Bronce) books a court for tomorrow (S/ 72.00 prepago).
        2. Admin approves the booking (Carlos: 9 reservations, 50 points).
        3. Carlos has a personal conflict, goes to history, and cancels the booking.
        4. Carlos' points drop to 40, reservations count drops to 8. A coupon `CRED-REFUND` (value S/ 72.00) is generated.
        5. Carlos schedules a booking for next week. He applies the `CRED-REFUND` coupon.
        6. Final price is S/ 0.00. Carlos generates S/ 0 receipt, submits.
        7. Admin approves the free booking.
    *   *Expected Result*: Carlos' points return to 50, completed reservations becomes 9. The refund was successfully credited and consumed.
*   **TC-T4-SCEN-03: Rapid Double Level Promotion**
    *   *Steps*:
        1. User Roberto Gómez (14 completed reservations, 120 points, Level Plata) submits a Yape booking request.
        2. Admin validates payment -> Roberto completed reservations becomes 15, level remains Plata.
        3. Admin manually updates Roberto's completed reservations count to 24 via DB/Admin console (to simulate rapid sequential bookings).
        4. Roberto submits another booking. Total price is S/ 68.40 (incorporating Plata's 5% discount).
        5. Admin approves the payment.
    *   *Expected Result*: Roberto's completed reservations becomes 25. His level automatically upgrades to **Oro** (verified in client and admin dashboards). Future bookings show Oro's 10% discount (S/ 64.80).
*   **TC-T4-SCEN-04: Fraud Rejection & Correction Flow**
    *   *Steps*:
        1. Client submits a booking request uploading a screenshot of an old transaction.
        2. Admin audits request, flags it as invalid, clicks "Fraude / Error", inputs reason: "Comprobante ya utilizado / repetido".
        3. Client opens "Mis Comprobantes", observes status is "Rechazado" with reason displayed. No points or reservations count added.
        4. Client transfers the correct amount via Yape, takes a new screenshot, and submits a fresh request.
        5. Admin audits the new request, verifies validity, and approves.
    *   *Expected Result*: Client's history updates to Approved, points balance increases by 10, reservations count increases by 1.
*   **TC-T4-SCEN-05: Double Booking / Slot Conflict**
    *   *Steps*:
        1. Carlos (User 1) opens the portal and selects Cancha 1, 2026-06-17, 19:00 - 20:30.
        2. Roberto (User 2) opens the portal and selects the same court and slot.
        3. Carlos generates receipt and clicks "Confirmar y Subir Reserva".
        4. Roberto attempts to click "Confirmar y Subir Reserva" immediately after.
    *   *Expected Result*: Carlos' request is successfully registered. Roberto's request is blocked by frontend validation (showing "Horario ocupado" or similar slot conflict message) or database transaction unique constraints prevent concurrent bookings for the same court/slot.

---

## 3. Verification & Execution Strategy

To execute and verify these test cases, we recommend using a dual test runner strategy:

1.  **Vitest (Unit & Integration)**:
    *   Test file: `src/context/__tests__/TournamentContext.test.tsx` (to be created).
    *   Verify: State updates, points logic, level transitions, and coupon creation helper functions.
2.  **Playwright (End-to-End browser tests)**:
    *   Verify: Role routing, multi-tab real-time sync, visual screenshot auditing, and user flows.
