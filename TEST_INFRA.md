# Test Infrastructure Documentation (TEST_INFRA.md)

This document maps the complete set of 60 End-to-End (E2E) test cases across 4 tiers designed to validate the Padel-Cash and Supabase integration features.

---

## E2E Testing Tiers

### Tier 1: Feature Coverage (25 Test Cases)

#### Feature 1: Email Login
* **TC-T1-LOGIN-01: Successful Administrator Login**
  * *Preconditions*: Admin credentials exist in the database (email `admin@club.com`, password `adminpassword`).
  * *Steps*:
    1. Send a login request using valid admin credentials.
  * *Expected Result*: Returns a valid authentication session, role is resolved to 'admin'.
* **TC-T1-LOGIN-02: User Login with Valid Format**
  * *Preconditions*: Player user credentials exist (email `carlos@diaz.com`, password `playerpassword`).
  * *Steps*:
    1. Send a login request using valid player credentials.
  * *Expected Result*: Returns a valid session, role is resolved to 'player'.
* **TC-T1-LOGIN-03: Invalid Password Rejection**
  * *Preconditions*: Account exists in the database.
  * *Steps*:
    1. Attempt login with correct email but incorrect password.
  * *Expected Result*: Auth fails with invalid credentials error.
* **TC-T1-LOGIN-04: Non-existent Account Attempt**
  * *Preconditions*: Email address is not registered in the database.
  * *Steps*:
    1. Attempt login with unregistered email.
  * *Expected Result*: Auth fails with invalid credentials error.
* **TC-T1-LOGIN-05: Session Persistence on Page Reload**
  * *Preconditions*: Session is active.
  * *Steps*:
    1. Fetch current session after reload/refresh.
  * *Expected Result*: User remains authenticated, session is active.

#### Feature 2: Role Routing
* **TC-T1-ROUTE-01: Admin Access Redirection**
  * *Preconditions*: Authenticated user has "admin" role.
  * *Steps*:
    1. Verify user profile role column.
  * *Expected Result*: Role resolves to 'admin', granting dashboard access.
* **TC-T1-ROUTE-02: Guest Access Restriction**
  * *Preconditions*: Guest user (unauthenticated).
  * *Steps*:
    1. Attempt to query protected dashboard metadata.
  * *Expected Result*: Denied/Unauthorized response.
* **TC-T1-ROUTE-03: Client Routing to Padel-Cash Portal**
  * *Preconditions*: Authenticated user has "player" role.
  * *Steps*:
    1. Verify profile role.
  * *Expected Result*: Role resolves to 'player', permitting player portal access.
* **TC-T1-ROUTE-04: Role Switch Simulation (Dropdown)**
  * *Preconditions*: Admin logged in.
  * *Steps*:
    1. Query different player profiles.
  * *Expected Result*: Different balances and records returned.
* **TC-T1-ROUTE-05: Secure Logout Redirect**
  * *Preconditions*: Authenticated user session.
  * *Steps*:
    1. Call sign-out.
  * *Expected Result*: Session terminated, subsequent queries return unauthorized.

#### Feature 3: Yape Booking Request
* **TC-T1-YAPE-01: Prepago Discount Selection**
  * *Preconditions*: Booking initiated with anticipated payment.
  * *Steps*:
    1. Calculate total for court booking (base price S/ 80.00).
  * *Expected Result*: Anticipated discount of 10% applied (S/ 72.00).
* **TC-T1-YAPE-02: Demo Screenshot Generation**
  * *Preconditions*: Booking request payload.
  * *Steps*:
    1. Attach screenshot URL.
  * *Expected Result*: Booking request has screenshot_url field populated.
* **TC-T1-YAPE-03: Booking Request Submission**
  * *Preconditions*: Court details and screenshot uploaded.
  * *Steps*:
    1. Submit reservation and payment requests.
  * *Expected Result*: Insertion into `reservations` and `yape_payments` successful.
* **TC-T1-YAPE-04: Pending Status Verification**
  * *Preconditions*: Booking submitted.
  * *Steps*:
    1. Fetch reservation status.
  * *Expected Result*: Status is initially 'pending'.
* **TC-T1-YAPE-05: Receipt Details Verification**
  * *Preconditions*: Reservation in history.
  * *Steps*:
    1. Query user's booking history.
  * *Expected Result*: Details match (court, date, slot, amount).

#### Feature 4: Admin Approval
* **TC-T1-APPROVAL-01: Queue Population**
  * *Preconditions*: User has submitted a pending booking request.
  * *Steps*:
    1. Query all pending `yape_payments` as Admin.
  * *Expected Result*: The submitted payment appears in the queue.
* **TC-T1-APPROVAL-02: Auditoría Visual Preview**
  * *Preconditions*: Admin is inspecting the queue.
  * *Steps*:
    1. Query single payment details by ID.
  * *Expected Result*: Details including screenshot_url are retrieved.
* **TC-T1-APPROVAL-03: Validation Approval Workflow**
  * *Preconditions*: Admin validates payment.
  * *Steps*:
    1. Update `yape_payments` status to 'approved'.
  * *Expected Result*: Status changes, reservations marked 'confirmed', client points incremented by 10.
* **TC-T1-APPROVAL-04: Validation Rejection Workflow**
  * *Preconditions*: Admin rejects payment.
  * *Steps*:
    1. Update `yape_payments` status to 'rejected' with reason.
  * *Expected Result*: Status transitions, reservations marked 'cancelled', rejection reason stored.
* **TC-T1-APPROVAL-05: Manual Points Adjustment**
  * *Preconditions*: Admin adjusts user points.
  * *Steps*:
    1. Update `profiles` points column.
  * *Expected Result*: Points updated successfully.

#### Feature 5: Coupon Management
* **TC-T1-COUPON-01: Claim Coupon Enablement**
  * *Preconditions*: User points >= 100.
  * *Steps*:
    1. Verify user eligibility.
  * *Expected Result*: Coupon can be claimed.
* **TC-T1-COUPON-02: Coupon Generation & Deduct Points**
  * *Preconditions*: User has 120 points.
  * *Steps*:
    1. Request to claim coupon.
  * *Expected Result*: Coupon code generated, points balance decremented by 100 (now 20).
* **TC-T1-COUPON-03: Claim Coupon Disablement**
  * *Preconditions*: User points < 100.
  * *Steps*:
    1. Attempt to claim coupon.
  * *Expected Result*: Request rejected / blocked due to insufficient points.
* **TC-T1-COUPON-04: Coupon Selection in Simulator**
  * *Preconditions*: User has an unused coupon.
  * *Steps*:
    1. Query user's active coupons.
  * *Expected Result*: Unused coupon is returned in list.
* **TC-T1-COUPON-05: Booking Price Discount Calculation**
  * *Preconditions*: Applying S/ 50 coupon to booking.
  * *Steps*:
    1. Apply coupon to price.
  * *Expected Result*: Booking price reduced by S/ 50.00.

---

### Tier 2: Boundary & Corner Cases (25 Test Cases)

#### Scenario A: Empty Fields
* **TC-T2-EMPTY-01: Empty Login Submit**
  * *Steps*: Attempt sign-in with empty email/password.
  * *Expected Result*: Rejection by client or Auth API.
* **TC-T2-EMPTY-02: Missing Screenshot on Booking Submit**
  * *Steps*: Submit booking without payment details/screenshot.
  * *Expected Result*: Database check constraints or RLS prevents insertion.
* **TC-T2-EMPTY-03: Empty Rejection Reason**
  * *Steps*: Reject payment with empty string for reason.
  * *Expected Result*: Validation blocks transition or defaults reason.
* **TC-T2-EMPTY-04: Empty Manual Points Input**
  * *Steps*: Apply manual points adjustment with null/empty value.
  * *Expected Result*: Update ignored or validation blocks.
* **TC-T2-EMPTY-05: Empty Onboarding Fields**
  * *Steps*: Create user profile with empty name/phone.
  * *Expected Result*: DB schema constraint violation (not null).

#### Scenario B: Invalid Emails
* **TC-T2-EMAIL-01: Invalid Email Format in Login**
  * *Steps*: Login with `invalidemail.com`.
  * *Expected Result*: Auth API rejects format.
* **TC-T2-EMAIL-02: Missing Domain Extension**
  * *Steps*: Login with `admin@club`.
  * *Expected Result*: Auth API rejects.
* **TC-T2-EMAIL-03: Special Characters Injection Attempt**
  * *Steps*: Login with `' OR 1=1 --`.
  * *Expected Result*: Handled safely, rejection.
* **TC-T2-EMAIL-04: Excessively Long Email Input**
  * *Steps*: Login with 300 character email.
  * *Expected Result*: Handled safely.
* **TC-T2-EMAIL-05: Case Sensitivity Handling**
  * *Steps*: Login with uppercase email.
  * *Expected Result*: Normalizes to lowercase and authenticates successfully.

#### Scenario C: Negative Points
* **TC-T2-POINTS-01: Cancellation Points Deduction Floor**
  * *Preconditions*: User has 5 points.
  * *Steps*: Cancel booking (triggers -10 penalty).
  * *Expected Result*: Points balance drops to 0, not negative.
* **TC-T2-POINTS-02: Admin Manual Points Reduction Floor**
  * *Preconditions*: User has 15 points.
  * *Steps*: Admin updates points by `-50`.
  * *Expected Result*: Balance is set to 0.
* **TC-T2-POINTS-03: Multiple Cancellations Points Check**
  * *Preconditions*: User has 0 points.
  * *Steps*: Multi-cancellation penalty.
  * *Expected Result*: Balance remains 0.
* **TC-T2-POINTS-04: Coupon Claim Points Boundary (99 PTS)**
  * *Preconditions*: User has exactly 99 points.
  * *Steps*: Attempt to claim coupon.
  * *Expected Result*: Insufficient points error.
* **TC-T2-POINTS-05: Supabase DB Constraint Verification**
  * *Steps*: Run query `UPDATE profiles SET points = -1`.
  * *Expected Result*: Rejected due to CHECK constraint `points >= 0`.

#### Scenario D: Row Level Security (RLS) Validation
* **TC-T2-RLS-01: Guest Booking Request Insertion**
  * *Steps*: Unauthenticated user attempts booking insert.
  * *Expected Result*: Rejected by RLS policy.
* **TC-T2-RLS-02: User Tampering with Points**
  * *Steps*: Non-admin player attempts to update their own points column.
  * *Expected Result*: Rejected by RLS policy or trigger function overrides.
* **TC-T2-RLS-03: User Approving Own Payment**
  * *Steps*: Non-admin player attempts to UPDATE `yape_payments.status` to 'approved'.
  * *Expected Result*: Rejected by RLS policy.
* **TC-T2-RLS-04: Reading Peer Payment Requests**
  * *Steps*: Player A queries `yape_payments` of Player B.
  * *Expected Result*: Query returns 0 records due to RLS filter `user_id = auth.uid()`.
* **TC-T2-RLS-05: Non-Admin Manual Points Adjustment API**
  * *Steps*: Non-admin attempts to invoke admin RPC functions.
  * *Expected Result*: Rejected by database permissions.

#### Scenario E: Invalid Payment Status Transitions
* **TC-T2-TRANS-01: Re-approving Approved Payment**
  * *Steps*: Update already approved payment status to 'approved'.
  * *Expected Result*: Transition blocked or results in no-op.
* **TC-T2-TRANS-02: Rejecting Approved Payment**
  * *Steps*: Update approved payment status to 'rejected'.
  * *Expected Result*: State transition rejected.
* **TC-T2-TRANS-03: Approving Rejected Payment**
  * *Steps*: Update rejected payment status to 'approved'.
  * *Expected Result*: State transition rejected.
* **TC-T2-TRANS-04: Cancelling Pending Payment Booking**
  * *Steps*: Cancel a booking that is still pending validation.
  * *Expected Result*: Credit coupon is NOT generated, booking marked cancelled.
* **TC-T2-TRANS-05: Cancelling Canceled/Refunded Booking**
  * *Steps*: Re-cancel cancelled booking.
  * *Expected Result*: Request rejected.

---

### Tier 3: Cross-Feature Combinations (5 Test Cases)

* **TC-T3-COMB-01: Approval Chain Reaction (Payment + Points + Level)**
  * *Steps*:
    1. Admin approves a player's pending booking request.
  * *Expected Result*:
    1. Payment is 'approved'.
    2. Completed reservations increments.
    3. User points increase by 10.
    4. Level upgrades to 'plata' if 10 reservations reached.
* **TC-T3-COMB-02: Coupon Redemption and Booking Consumption**
  * *Steps*:
    1. User claims points coupon (points balance drops).
    2. User submits booking applying the coupon code.
  * *Expected Result*: Price is reduced, coupon state is marked `isUsed: true`.
* **TC-T3-COMB-03: Booking Cancellation and Refund Loop**
  * *Steps*:
    1. Player cancels an approved booking (S/ 72.00).
  * *Expected Result*: Booking is cancelled, reservations count decrements, points penalty (-10) applied, credit coupon (S/ 72.00) created.
* **TC-T3-COMB-04: Compounded Discounts (Anticipated + Level + Coupon)**
  * *Steps*:
    1. Plata or Oro player books with anticipated payment (Yape 10% discount) and applies S/ 50 coupon.
  * *Expected Result*: Final price incorporates level discount, 10% pre-paid discount, and coupon reduction.
* **TC-T3-COMB-05: Real-Time Tab Synchronization**
  * *Steps*:
    1. Admin approves payment.
  * *Expected Result*: Player's context updates instantly without reload.

---

### Tier 4: Real-World Application Scenarios (5 Test Cases)

* **TC-T4-SCEN-01: The Loyalty Cycle**
  * *Steps*: User registers -> makes anticipated booking -> Admin approves -> Points hit 100 -> User claims S/ 50 coupon -> applies coupon on next booking -> Admin approves.
  * *Expected Result*: Whole flow succeeds, balances and state persist correctly.
* **TC-T4-SCEN-02: The Refund and Re-booking Scenario**
  * *Steps*: User books court -> payment approved -> cancels booking -> receives credit coupon -> uses credit coupon on new booking -> payment approved.
  * *Expected Result*: Booking created for S/ 0, coupon consumed.
* **TC-T4-SCEN-03: Rapid Double Level Promotion**
  * *Steps*: Plata user (14 completed reservations) gets booking approved -> upgrades to Plata (15 completed) -> admin boosts completed count to 24 -> user gets another booking approved -> upgrades to Oro (25 completed).
  * *Expected Result*: Level transitions trigger automatically.
* **TC-T4-SCEN-04: Fraud Rejection & Correction Flow**
  * *Steps*: User uploads fraud screenshot -> Admin rejects -> User uploads correct screenshot -> Admin approves.
  * *Expected Result*: Final booking approved.
* **TC-T4-SCEN-05: Double Booking / Slot Conflict**
  * *Steps*: Two users try to reserve same court/date/slot.
  * *Expected Result*: First insert succeeds, second is rejected by constraint.
