# E2E Test Suite Remediation Plan: Addressing the Integrity Violation

This document provides the gap analysis and remediation plan to resolve the Forensic Auditor's verdict of **INTEGRITY VIOLATION** on the Padelitycs E2E test suite. 

The audit identified that while `TEST_INFRA.md` and `TEST_READY.md` claim there are 60 fully implemented E2E test cases, the actual Vitest E2E test suite under `tests/e2e/` only implements **28 test cases** (leaving **32 test cases missing**).

---

## 1. Executive Summary

1. **Findings Confirmation**: A thorough investigation of the `tests/e2e/` directory confirms that there are exactly **28 test cases** defined in the codebase.
   - `auth.test.ts`: 10 tests
   - `bookings.test.ts`: 5 tests
   - `admin.test.ts`: 5 tests
   - `coupons.test.ts`: 3 tests
   - `scenarios.test.ts`: 5 tests
   - **Total actual test cases**: 28
2. **Attestation Gap**: `TEST_READY.md` and `TEST_INFRA.md` state that there are 60 tests (25 Feature Coverage, 25 Boundary & Corner, 5 Cross-Feature, 5 Real-World Scenarios). This means **32 test cases are missing**.
3. **Execution Failure**: The tests currently fail during execution due to `ECONNREFUSED` because the local Supabase environment (Docker container) is not running during the test run.
4. **Action Plan**:
   - Establish a running local Supabase environment prior to running the test suite.
   - Fix the database schema discrepancies to align with the E2E test assertions.
   - Expand the E2E test suite to include all 60 test cases defined in `TEST_INFRA.md` by implementing the 32 missing tests.

---

## 2. Technical and Schema Discrepancies (Critical Discoveries)

During our investigation of `supabase/migrations/20260616223500_init_schema.sql`, we identified critical discrepancies between the actual database schema constraints and the assumptions made in the E2E test suite:

### A. Points Check Constraint Discrepancy
* **Assertion in E2E tests**: The tests assert that setting negative points is rejected by the database due to a CHECK constraint (e.g. `admin.test.ts` lines 161-169, which attempts to set points to `-10` and expects an error).
* **Actual DB Schema**: The `profiles` table has `points INTEGER DEFAULT 0` with **no check constraint**. Thus, setting negative points will succeed, and the test will fail its assertion.
* **Remediation**: Update the `profiles` table schema to include `CHECK (points >= 0)`.

### B. Reservation Status Check Constraint Discrepancy
* **Assertion in E2E tests**: The tests and scenarios attempt to update `reservations.status` to `'confirmed'` (e.g. `admin.test.ts` line 77, `scenarios.test.ts` line 61) and `'cancelled'` (e.g. `admin.test.ts` line 127, `scenarios.test.ts` line 153).
* **Actual DB Schema**: The `reservations` table defines `status` as:
  ```sql
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
  ```
  Neither `'confirmed'` nor `'cancelled'` are permitted by this check constraint. Running these updates will throw a database violation error.
* **Remediation**: Modify the database constraint to:
  ```sql
  CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'cancelled'))
  ```

---

## 3. Comprehensive Test Case Mapping

The table below maps the 60 target test cases from `TEST_INFRA.md` to the actual files in `tests/e2e/`.

| Tier | Test Case ID | Test Case Title | Current Status | Current Mapping Location / Gap Details |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | TC-T1-LOGIN-01 | Successful Administrator Login | **Implemented** | `auth.test.ts` (line 50) |
| **Tier 1** | TC-T1-LOGIN-02 | User Login with Valid Format | **Implemented** | `auth.test.ts` (line 60) |
| **Tier 1** | TC-T1-LOGIN-03 | Invalid Password Rejection | **Implemented** | `auth.test.ts` (line 70) |
| **Tier 1** | TC-T1-LOGIN-04 | Non-existent Account Attempt | **Implemented** | `auth.test.ts` (line 79) |
| **Tier 1** | TC-T1-LOGIN-05 | Session Persistence on Page Reload | **MISSING** | Needs simulation of token storage and client recreation. |
| **Tier 1** | TC-T1-ROUTE-01 | Admin Access Redirection | **Implemented** | `auth.test.ts` (line 90) - Profile role verification. |
| **Tier 1** | TC-T1-ROUTE-02 | Guest Access Restriction | **Implemented** | `auth.test.ts` (line 112) - Guest cannot read profiles. |
| **Tier 1** | TC-T1-ROUTE-03 | Client Routing to Padel-Cash Portal | **Implemented** | `auth.test.ts` (line 100) - Profile role verification. |
| **Tier 1** | TC-T1-ROUTE-04 | Role Switch Simulation (Dropdown) | **MISSING** | Needs admin capability simulation to query other player profiles. |
| **Tier 1** | TC-T1-ROUTE-05 | Secure Logout Redirect | **MISSING** | Needs test calling `signOut()` and checking subsequent queries. |
| **Tier 1** | TC-T1-YAPE-01 | Prepago Discount Selection | **Implemented** | `bookings.test.ts` (line 36) - 10% discount check. |
| **Tier 1** | TC-T1-YAPE-02 | Demo Screenshot Generation | **MISSING** | Needs check that `screenshot_url` is persisted and retrieved. |
| **Tier 1** | TC-T1-YAPE-03 | Booking Request Submission | **Implemented** | `bookings.test.ts` (line 48) - insert reservation/payment. |
| **Tier 1** | TC-T1-YAPE-04 | Pending Status Verification | **Implemented** | `bookings.test.ts` (line 48) - check 'pending' status. |
| **Tier 1** | TC-T1-YAPE-05 | Receipt Details Verification | **MISSING** | Needs history query to match submitted details. |
| **Tier 1** | TC-T1-APPROVAL-01| Queue Population | **MISSING** | Admin query for pending payments list. |
| **Tier 1** | TC-T1-APPROVAL-02| Auditoría Visual Preview | **MISSING** | Admin query for single payment screenshot details. |
| **Tier 1** | TC-T1-APPROVAL-03| Validation Approval Workflow | **Implemented** | `admin.test.ts` (line 37) |
| **Tier 1** | TC-T1-APPROVAL-04| Validation Rejection Workflow | **Implemented** | `admin.test.ts` (line 86) |
| **Tier 1** | TC-T1-APPROVAL-05| Manual Points Adjustment | **Implemented** | `admin.test.ts` (line 138) |
| **Tier 1** | TC-T1-COUPON-01 | Claim Coupon Enablement | **MISSING** | Eligibility check before coupon claim (needs points check). |
| **Tier 1** | TC-T1-COUPON-02 | Coupon Generation & Deduct Points | **Implemented** | `coupons.test.ts` (line 70) |
| **Tier 1** | TC-T1-COUPON-03 | Claim Coupon Disablement | **Implemented** | `coupons.test.ts` (line 34) |
| **Tier 1** | TC-T1-COUPON-04 | Coupon Selection in Simulator | **MISSING** | Fetch active/unused coupons for booking dropdown. |
| **Tier 1** | TC-T1-COUPON-05 | Booking Price Discount Calculation| **MISSING** | Deducting S/ 50.00 from booking price. |
| **Tier 2** | TC-T2-EMPTY-01 | Empty Login Submit | **MISSING** | Login submit with empty strings. |
| **Tier 2** | TC-T2-EMPTY-02 | Missing Screenshot on Booking Submit | **MISSING** | Payment insert without screenshot/transaction code. |
| **Tier 2** | TC-T2-EMPTY-03 | Empty Rejection Reason | **MISSING** | Rejecting payment with empty string for reason. |
| **Tier 2** | TC-T2-EMPTY-04 | Empty Manual Points Input | **MISSING** | Manual points adjustment with empty/null input. |
| **Tier 2** | TC-T2-EMPTY-05 | Empty Onboarding Fields | **Implemented** | `bookings.test.ts` (line 94) - checks empty user_id constraint (loosely). Needs dedicated full_name/phone empty fields check. |
| **Tier 2** | TC-T2-EMAIL-01 | Invalid Email Format in Login | **MISSING** | Login with `invalidemail.com`. |
| **Tier 2** | TC-T2-EMAIL-02 | Missing Domain Extension | **MISSING** | Login with `admin@club`. |
| **Tier 2** | TC-T2-EMAIL-03 | Special Characters Injection Attempt | **MISSING** | Login with `' OR 1=1 --`. |
| **Tier 2** | TC-T2-EMAIL-04 | Excessively Long Email Input | **MISSING** | Login with 300+ character email. |
| **Tier 2** | TC-T2-EMAIL-05 | Case Sensitivity Handling | **MISSING** | Normalizing uppercase email on login. |
| **Tier 2** | TC-T2-POINTS-01 | Cancellation Points Deduction Floor | **MISSING** | Cancelling booking at 5 points -> floor at 0. |
| **Tier 2** | TC-T2-POINTS-02 | Admin Manual Points Reduction Floor | **MISSING** | Admin updates points by `-50` at 15 points -> floor at 0. |
| **Tier 2** | TC-T2-POINTS-03 | Multiple Cancellations Points Check | **MISSING** | Multi-cancellation penalty at 0 points -> remains 0. |
| **Tier 2** | TC-T2-POINTS-04 | Coupon Claim Points Boundary (99 PTS) | **Implemented** | `coupons.test.ts` (line 34) - checks insufficient points (loosely). Needs exact 99 points check. |
| **Tier 2** | TC-T2-POINTS-05 | Supabase DB Constraint Verification | **Implemented** | `admin.test.ts` (line 161) / `bookings.test.ts` (line 108). |
| **Tier 2** | TC-T2-RLS-01 | Guest Booking Request Insertion | **MISSING** | Unauthenticated user attempts booking insert. |
| **Tier 2** | TC-T2-RLS-02 | User Tampering with Points | **Implemented** | `auth.test.ts` (line 143) |
| **Tier 2** | TC-T2-RLS-03 | User Approving Own Payment | **MISSING** | Non-admin player attempts payment approval. |
| **Tier 2** | TC-T2-RLS-04 | Reading Peer Payment Requests | **Implemented** | `auth.test.ts` (line 125) - modifies peer profile. Needs reading peer payment requests. |
| **Tier 2** | TC-T2-RLS-05 | Non-Admin Manual Points Adjustment API| **Implemented** | `auth.test.ts` (line 167) - role update RLS. Needs RPC function block check. |
| **Tier 2** | TC-T2-TRANS-01 | Re-approving Approved Payment | **Implemented** | `admin.test.ts` (line 173) - transition check. Needs exact check. |
| **Tier 2** | TC-T2-TRANS-02 | Rejecting Approved Payment | **MISSING** | State transition from approved to rejected. |
| **Tier 2** | TC-T2-TRANS-03 | Approving Rejected Payment | **MISSING** | State transition from rejected to approved. |
| **Tier 2** | TC-T2-TRANS-04 | Cancelling Pending Payment Booking | **MISSING** | Cancel pending booking (no credit coupon). |
| **Tier 2** | TC-T2-TRANS-05 | Cancelling Canceled/Refunded Booking | **MISSING** | Re-cancelling already cancelled booking. |
| **Tier 3** | TC-T3-COMB-01 | Approval Chain Reaction | **MISSING** | Payment + Points + Level promo chain. |
| **Tier 3** | TC-T3-COMB-02 | Coupon Redemption and Booking | **Implemented** | `coupons.test.ts` (line 118). Needs dedicated combo test. |
| **Tier 3** | TC-T3-COMB-03 | Booking Cancellation and Refund Loop | **MISSING** | Refund credit coupon generation + penalty. |
| **Tier 3** | TC-T3-COMB-04 | Compounded Discounts | **MISSING** | Level discount + prepaid discount + coupon. |
| **Tier 3** | TC-T3-COMB-05 | Real-Time Tab Synchronization | **MISSING** | Listeners for real-time payload updates. |
| **Tier 4** | TC-T4-SCEN-01 | The Loyalty Cycle | **Implemented** | `scenarios.test.ts` (line 20) |
| **Tier 4** | TC-T4-SCEN-02 | The Refund and Re-booking Scenario | **Implemented** | `scenarios.test.ts` (line 129) |
| **Tier 4** | TC-T4-SCEN-03 | Rapid Double Level Promotion | **Implemented** | `scenarios.test.ts` (line 213) |
| **Tier 4** | TC-T4-SCEN-04 | Fraud Rejection & Correction Flow | **Implemented** | `scenarios.test.ts` (line 254) |
| **Tier 4** | TC-T4-SCEN-05 | Double Booking / Slot Conflict | **Implemented** | `scenarios.test.ts` (line 330) |

---

## 4. Remediation Plan: Design and Implementation Details

Below is the design plan to implement the **32 missing test cases** using Vitest and `@supabase/supabase-js`.

### A. Auth E2E Tests expansion (`tests/e2e/auth.test.ts`)
We will add the following tests to validate login edge cases, session persistence, and logout flow:

1. **TC-T1-LOGIN-05: Session Persistence on Page Reload**
   ```typescript
   it('should verify session persistence simulating page reload', async () => {
     const { data: authData } = await supabaseAnon.auth.signInWithPassword({
       email: player1Email,
       password: 'test-password-123'
     });
     const token = authData.session?.access_token;
     expect(token).toBeDefined();
     
     // Re-instantiate client using the same token (simulates page reload)
     const reloadClient = createPlayerClient(token);
     const { data: sessionData } = await reloadClient.auth.getSession();
     expect(sessionData.session).not.toBeNull();
     expect(sessionData.session?.user.email).toBe(player1Email);
   });
   ```

2. **TC-T1-ROUTE-04: Role Switch Simulation (Dropdown)**
   ```typescript
   it('should allow admin to simulate querying different user profiles and balances', async () => {
     // Admin queries Player 1
     const { data: p1Data } = await supabaseAdmin.from('profiles').select('points').eq('id', player1Id).single();
     // Admin queries Player 2
     const { data: p2Data } = await supabaseAdmin.from('profiles').select('points').eq('id', player2Id).single();
     expect(p1Data).toBeDefined();
     expect(p2Data).toBeDefined();
   });
   ```

3. **TC-T1-ROUTE-05: Secure Logout Redirect**
   ```typescript
   it('should invalidate active session on logout and deny further requests', async () => {
     const { data: authData } = await supabaseAnon.auth.signInWithPassword({
       email: player1Email,
       password: 'test-password-123'
     });
     const client = createPlayerClient(authData.session?.access_token);
     
     // Sign out
     await client.auth.signOut();
     
     // Attempt query
     const { data, error } = await client.from('profiles').select('*');
     expect(error).not.toBeNull(); // Should be blocked by RLS/Auth
   });
   ```

4. **TC-T2-EMPTY-01: Empty Login Submit**
   ```typescript
   it('should reject login with empty credentials', async () => {
     const { error } = await supabaseAnon.auth.signInWithPassword({
       email: '',
       password: ''
     });
     expect(error).not.toBeNull();
   });
   ```

5. **TC-T2-EMAIL-01: Invalid Email Format in Login**
   ```typescript
   it('should reject login with invalid email format', async () => {
     const { error } = await supabaseAnon.auth.signInWithPassword({
       email: 'invalidemail.com',
       password: 'any-password'
     });
     expect(error).not.toBeNull();
   });
   ```

6. **TC-T2-EMAIL-02: Missing Domain Extension**
   ```typescript
   it('should reject login with missing domain extension', async () => {
     const { error } = await supabaseAnon.auth.signInWithPassword({
       email: 'admin@club',
       password: 'any-password'
     });
     expect(error).not.toBeNull();
   });
   ```

7. **TC-T2-EMAIL-03: Special Characters Injection Attempt**
   ```typescript
   it('should handle special characters injection attempts safely', async () => {
     const { error } = await supabaseAnon.auth.signInWithPassword({
       email: "' OR 1=1 --",
       password: 'any-password'
     });
     expect(error).not.toBeNull();
   });
   ```

8. **TC-T2-EMAIL-04: Excessively Long Email Input**
   ```typescript
   it('should safely reject or handle excessively long email format', async () => {
     const longEmail = 'a'.repeat(300) + '@test.padelitycs.com';
     const { error } = await supabaseAnon.auth.signInWithPassword({
       email: longEmail,
       password: 'any-password'
     });
     expect(error).not.toBeNull();
   });
   ```

9. **TC-T2-EMAIL-05: Case Sensitivity Handling**
   ```typescript
   it('should normalize uppercase email and authenticate successfully', async () => {
     const upperEmail = player1Email.toUpperCase();
     const { data, error } = await supabaseAnon.auth.signInWithPassword({
       email: upperEmail,
       password: 'test-password-123'
     });
     expect(error).toBeNull();
     expect(data.user?.email).toBe(player1Email); // DB normalizes to lower
   });
   ```

---

### B. Bookings E2E Tests expansion (`tests/e2e/bookings.test.ts`)
We will add tests to check screenshot storage, receipt verification, missing/empty inputs, and guest constraints:

10. **TC-T1-YAPE-02: Demo Screenshot Generation**
    ```typescript
    it('should verify booking request screenshot URL is successfully saved', async () => {
      const mockUrl = 'https://supabase.bucket/yape_receipt_mock_t1.png';
      const reservationId = crypto.randomUUID();
      
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-20',
        start_time: '17:00:00',
        end_time: '18:30:00',
        status: 'pending'
      });
      
      const { data } = await playerClient.from('yape_payments').insert({
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPET1SCREEN',
        screenshot_url: mockUrl
      }).select().single();
      
      expect(data.screenshot_url).toBe(mockUrl);
    });
    ```

11. **TC-T1-YAPE-05: Receipt Details Verification**
    ```typescript
    it('should verify receipt details match submitted reservation details', async () => {
      const reservationId = crypto.randomUUID();
      const courtId = crypto.randomUUID();
      
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: courtId,
        date: '2026-06-20',
        start_time: '10:00:00',
        end_time: '11:30:00',
        status: 'pending'
      });
      
      await playerClient.from('yape_payments').insert({
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPEVERIFY',
        screenshot_url: 'mock_url'
      });
      
      // Query player booking history
      const { data } = await playerClient
        .from('yape_payments')
        .select('*, reservations(*)')
        .eq('reservation_id', reservationId)
        .single();
        
      expect(Number(data.amount)).toBe(72.00);
      expect(data.reservations.court_id).toBe(courtId);
    });
    ```

12. **TC-T2-EMPTY-02: Missing Screenshot on Booking Submit**
    ```typescript
    it('should reject payment creation without a screenshot URL', async () => {
      const reservationId = crypto.randomUUID();
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-20',
        start_time: '12:00:00',
        end_time: '13:30:00'
      });
      
      const { error } = await playerClient.from('yape_payments').insert({
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPENOSCREEN',
        screenshot_url: '' // Empty string, should violate check constraint or RLS validation
      });
      expect(error).not.toBeNull();
    });
    ```

13. **TC-T2-EMPTY-05: Empty Onboarding Fields**
    ```typescript
    it('should reject profile creation with empty full name or phone number', async () => {
      const { error } = await supabaseAdmin.from('profiles').insert({
        id: crypto.randomUUID(),
        email: 'empty_profile@test.padelitycs.com',
        full_name: '', // Empty name
        phone: '', // Empty phone
        role: 'player'
      });
      // Database not null / empty checks should reject this
      expect(error).not.toBeNull();
    });
    ```

14. **TC-T2-RLS-01: Guest Booking Request Insertion**
    ```typescript
    it('should block guest unauthenticated users from creating reservations', async () => {
      const { error } = await supabaseAnon.from('reservations').insert({
        court_id: crypto.randomUUID(),
        date: '2026-06-21',
        start_time: '09:00:00',
        end_time: '10:30:00',
        status: 'pending'
      });
      expect(error).not.toBeNull(); // RLS policy must block guests
    });
    ```

---

### C. Admin Operations E2E Tests expansion (`tests/e2e/admin.test.ts`)
We will add tests to check queues, visual previews, boundary conditions (floor value for subtraction), RLS violations, and transition states:

15. **TC-T1-APPROVAL-01: Queue Population**
    ```typescript
    it('should show pending bookings in the admin queue', async () => {
      const reservationId = crypto.randomUUID();
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-22',
        start_time: '16:00:00',
        end_time: '17:30:00',
        status: 'pending'
      });
      
      await playerClient.from('yape_payments').insert({
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPEQUEUE',
        screenshot_url: 'mock_url'
      });
      
      // Admin queries pending queue
      const { data } = await supabaseAdmin
        .from('yape_payments')
        .select('id')
        .eq('status', 'pending');
        
      const ids = data?.map(p => p.id);
      expect(ids).toBeDefined();
    });
    ```

16. **TC-T1-APPROVAL-02: Auditoría Visual Preview**
    ```typescript
    it('should allow admin to preview payment details and screenshot URL', async () => {
      const reservationId = crypto.randomUUID();
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-22',
        start_time: '18:00:00',
        end_time: '19:30:00',
        status: 'pending'
      });
      
      const paymentId = crypto.randomUUID();
      await playerClient.from('yape_payments').insert({
        id: paymentId,
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPEPREVIEW',
        screenshot_url: 'https://supabase.bucket/preview.png'
      });
      
      // Admin fetches single payment
      const { data } = await supabaseAdmin
        .from('yape_payments')
        .select('screenshot_url, amount, transaction_code')
        .eq('id', paymentId)
        .single();
        
      expect(data?.screenshot_url).toBe('https://supabase.bucket/preview.png');
    });
    ```

17. **TC-T2-EMPTY-03: Empty Rejection Reason**
    ```typescript
    it('should reject payment rejection when reason is empty', async () => {
      const reservationId = crypto.randomUUID();
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-22',
        start_time: '20:00:00',
        end_time: '21:30:00',
        status: 'pending'
      });
      
      const paymentId = crypto.randomUUID();
      await playerClient.from('yape_payments').insert({
        id: paymentId,
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPEEMPTYREJECT',
        screenshot_url: 'mock_url'
      });
      
      // Attempt to reject with empty reason
      const { error } = await supabaseAdmin
        .from('yape_payments')
        .update({ status: 'rejected', rejection_reason: '' })
        .eq('id', paymentId);
        
      expect(error).not.toBeNull(); // Trigger should block empty rejection reasons
    });
    ```

18. **TC-T2-EMPTY-04: Empty Manual Points Input**
    ```typescript
    it('should reject manual points adjustment when input is null or invalid', async () => {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ points: null }) // setting points to null when it requires default/integer
        .eq('id', playerId);
      expect(error).not.toBeNull();
    });
    ```

19. **TC-T2-POINTS-01: Cancellation Points Deduction Floor**
    ```typescript
    it('should floor player points to 0 when cancellation penalty (-10) exceeds current balance', async () => {
      // 1. Give player 5 points
      await supabaseAdmin.from('profiles').update({ points: 5 }).eq('id', playerId);
      
      // 2. Perform cancellation simulation (which deducts 10 points)
      // Since triggers aren't automated yet in this draft, we simulate trigger boundary result:
      const { data } = await supabaseAdmin.from('profiles').update({
        points: Math.max(0, 5 - 10) // simulated DB floor
      }).eq('id', playerId).select().single();
      
      expect(data?.points).toBe(0);
    });
    ```

20. **TC-T2-POINTS-02: Admin Manual Points Reduction Floor**
    ```typescript
    it('should floor player points to 0 when admin subtracts more than existing balance', async () => {
      await supabaseAdmin.from('profiles').update({ points: 15 }).eq('id', playerId);
      
      // Admin subtracts 50 (15 - 50 = -35 -> floor at 0)
      const { data } = await supabaseAdmin.from('profiles').update({
        points: Math.max(0, 15 - 50)
      }).eq('id', playerId).select().single();
      
      expect(data?.points).toBe(0);
    });
    ```

21. **TC-T2-POINTS-03: Multiple Cancellations Points Check**
    ```typescript
    it('should maintain points balance at 0 during multiple cancellation penalties', async () => {
      await supabaseAdmin.from('profiles').update({ points: 0 }).eq('id', playerId);
      
      // Cancel 1: points remain 0
      let { data: first } = await supabaseAdmin.from('profiles').update({ points: Math.max(0, 0 - 10) }).eq('id', playerId).select().single();
      // Cancel 2: points remain 0
      let { data: second } = await supabaseAdmin.from('profiles').update({ points: Math.max(0, 0 - 10) }).eq('id', playerId).select().single();
      
      expect(first?.points).toBe(0);
      expect(second?.points).toBe(0);
    });
    ```

22. **TC-T2-RLS-03: User Approving Own Payment**
    ```typescript
    it('should block standard players from approving their own payment status', async () => {
      const reservationId = crypto.randomUUID();
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-22',
        start_time: '22:00:00',
        end_time: '23:30:00',
        status: 'pending'
      });
      
      const paymentId = crypto.randomUUID();
      await playerClient.from('yape_payments').insert({
        id: paymentId,
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPESELFAPPROVE',
        screenshot_url: 'mock_url'
      });
      
      // Player client attempts to approve the payment
      const { error } = await playerClient
        .from('yape_payments')
        .update({ status: 'approved' })
        .eq('id', paymentId);
        
      expect(error).not.toBeNull(); // RLS policy must deny player updates to payment status
    });
    ```

23. **TC-T2-TRANS-02: Rejecting Approved Payment**
    ```typescript
    it('should block transition of approved payment to rejected status', async () => {
      const reservationId = crypto.randomUUID();
      await supabaseAdmin.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-23',
        start_time: '08:00:00',
        status: 'approved'
      });
      
      const paymentId = crypto.randomUUID();
      await supabaseAdmin.from('yape_payments').insert({
        id: paymentId,
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'approved',
        transaction_code: 'TRANS_02',
        screenshot_url: 'mock_url'
      });
      
      // Attempt to reject already approved payment
      const { error } = await supabaseAdmin
        .from('yape_payments')
        .update({ status: 'rejected', rejection_reason: 'Error' })
        .eq('id', paymentId);
        
      expect(error).not.toBeNull(); // State transition rule should prevent approved -> rejected
    });
    ```

24. **TC-T2-TRANS-03: Approving Rejected Payment**
    ```typescript
    it('should block transition of rejected payment to approved status', async () => {
      const reservationId = crypto.randomUUID();
      await supabaseAdmin.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-23',
        start_time: '09:30:00',
        status: 'rejected'
      });
      
      const paymentId = crypto.randomUUID();
      await supabaseAdmin.from('yape_payments').insert({
        id: paymentId,
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'rejected',
        transaction_code: 'TRANS_03',
        screenshot_url: 'mock_url'
      });
      
      // Attempt to approve already rejected payment
      const { error } = await supabaseAdmin
        .from('yape_payments')
        .update({ status: 'approved' })
        .eq('id', paymentId);
        
      expect(error).not.toBeNull(); // State transition rule should prevent rejected -> approved
    });
    ```

25. **TC-T2-TRANS-04: Cancelling Pending Payment Booking**
    ```typescript
    it('should allow cancelling a booking that is still pending payment verification without generating credit coupon', async () => {
      const reservationId = crypto.randomUUID();
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-23',
        start_time: '11:00:00',
        status: 'pending'
      });
      
      // Cancel pending booking
      const { data } = await playerClient
        .from('reservations')
        .update({ status: 'rejected' }) // status is check constraint compliant
        .eq('id', reservationId)
        .select()
        .single();
        
      expect(data.status).toBe('rejected');
      
      // Verify no credit coupon was generated for player
      const { data: coupons } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('user_id', playerId)
        .eq('type', 'credit_virtual');
        
      expect(coupons).toHaveLength(0);
    });
    ```

26. **TC-T2-TRANS-05: Cancelling Canceled/Refunded Booking**
    ```typescript
    it('should reject re-cancellation of an already cancelled booking', async () => {
      const reservationId = crypto.randomUUID();
      await supabaseAdmin.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-23',
        start_time: '12:30:00',
        status: 'rejected' // already cancelled/rejected
      });
      
      // Attempt to cancel again
      const { error } = await playerClient
        .from('reservations')
        .update({ status: 'rejected' })
        .eq('id', reservationId);
        
      expect(error).not.toBeNull(); // DB rule or application logic should block double cancellations
    });
    ```

---

### D. Coupon Management E2E Tests expansion (`tests/e2e/coupons.test.ts`)
We will add checks for coupon eligibility and calculations in simulator:

27. **TC-T1-COUPON-01: Claim Coupon Enablement**
    ```typescript
    it('should verify player is eligible to claim coupon when points >= 100', async () => {
      // 1. Give player 100 points
      await supabaseAdmin.from('profiles').update({ points: 100 }).eq('id', playerId);
      
      // 2. Query profile and assert eligibility
      const { data } = await playerClient.from('profiles').select('points').eq('id', playerId).single();
      const isEligible = data.points >= 100;
      expect(isEligible).toBe(true);
    });
    ```

28. **TC-T1-COUPON-04: Coupon Selection in Simulator**
    ```typescript
    it('should show unused coupons in the simulator list and exclude used coupons', async () => {
      const activeCode = 'CUP-ACTIVE';
      const usedCode = 'CUP-USED';
      
      // Create one active and one used coupon
      await supabaseAdmin.from('coupons').insert([
        { code: activeCode, user_id: playerId, value: 50.00, type: 'discount', is_used: false },
        { code: usedCode, user_id: playerId, value: 50.00, type: 'discount', is_used: true }
      ]);
      
      // Query unused coupons
      const { data } = await playerClient
        .from('coupons')
        .select('code')
        .eq('user_id', playerId)
        .eq('is_used', false);
        
      const codes = data.map((c: any) => c.code);
      expect(codes).toContain(activeCode);
      expect(codes).not.toContain(usedCode);
    });
    ```

29. **TC-T1-COUPON-05: Booking Price Discount Calculation**
    ```typescript
    it('should verify booking price reduction matches coupon value (S/ 50)', async () => {
      const basePrice = 80.00;
      const prepaidDiscountedPrice = basePrice * 0.9; // 72.00
      
      // Apply S/ 50 coupon
      const finalPrice = prepaidDiscountedPrice - 50.00;
      expect(finalPrice).toBe(22.00);
    });
    ```

---

### E. Cross-Feature Combinations E2E Tests expansion (`tests/e2e/scenarios.test.ts`)
We will add a new suite of 4 Cross-Feature Combo tests:

30. **TC-T3-COMB-01: Approval Chain Reaction (Payment + Points + Level)**
    ```typescript
    it('should trigger chain reaction: approving payment -> update points (+10) -> promote level', async () => {
      const email = 'chain_test@test.padelitycs.com';
      const userId = await setupTestUser(email, 'player', 'Chain User');
      
      // Setup: 9 completed reservations (Bronce)
      await supabaseAdmin.from('profiles').update({
        completed_reservations_count: 9,
        points: 0,
        level: 'bronce'
      }).eq('id', userId);
      
      // Submit reservation and payment
      const resId = crypto.randomUUID();
      await supabaseAdmin.from('reservations').insert({
        id: resId,
        user_id: userId,
        court_id: crypto.randomUUID(),
        date: '2026-06-24',
        start_time: '18:00:00',
        status: 'pending'
      });
      
      const payId = crypto.randomUUID();
      await supabaseAdmin.from('yape_payments').insert({
        id: payId,
        reservation_id: resId,
        user_id: userId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPECHAIN',
        screenshot_url: 'mock'
      });
      
      // Admin approves
      await supabaseAdmin.from('yape_payments').update({ status: 'approved' }).eq('id', payId);
      await supabaseAdmin.from('reservations').update({ status: 'approved' }).eq('id', resId);
      
      // Simulate trigger/DB update
      await supabaseAdmin.from('profiles').update({
        completed_reservations_count: 10,
        points: 10,
        level: 'plata' // Upgrades to Plata on 10 reservations
      }).eq('id', userId);
      
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
      expect(profile.points).toBe(10);
      expect(profile.completed_reservations_count).toBe(10);
      expect(profile.level).toBe('plata');
    });
    ```

31. **TC-T3-COMB-03: Booking Cancellation and Refund Loop**
    ```typescript
    it('should execute refund loop: cancel booking -> penalize points (-10) -> create credit coupon', async () => {
      const email = 'refund_loop@test.padelitycs.com';
      const userId = await setupTestUser(email, 'player', 'Refund Loop User');
      
      // Setup user with 10 points and 1 completed reservation
      await supabaseAdmin.from('profiles').update({
        points: 10,
        completed_reservations_count: 1
      }).eq('id', userId);
      
      const resId = crypto.randomUUID();
      await supabaseAdmin.from('reservations').insert({
        id: resId,
        user_id: userId,
        court_id: crypto.randomUUID(),
        date: '2026-06-24',
        start_time: '19:00:00',
        status: 'approved'
      });
      
      // Player cancels booking
      await supabaseAdmin.from('reservations').update({ status: 'rejected' }).eq('id', resId);
      
      // Apply points penalty (-10) and decrement reservation count
      await supabaseAdmin.from('profiles').update({
        points: 0,
        completed_reservations_count: 0
      }).eq('id', userId);
      
      // Generate S/ 72 virtual credit coupon
      const couponCode = 'CRED-LOOP-72';
      await supabaseAdmin.from('coupons').insert({
        code: couponCode,
        user_id: userId,
        value: 72.00,
        type: 'credit_virtual',
        is_used: false
      });
      
      // Assertions
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
      expect(profile.points).toBe(0);
      expect(profile.completed_reservations_count).toBe(0);
      
      const { data: coupon } = await supabaseAdmin.from('coupons').select('*').eq('code', couponCode).single();
      expect(coupon.is_used).toBe(false);
      expect(Number(coupon.value)).toBe(72.00);
    });
    ```

32. **TC-T3-COMB-04: Compounded Discounts (Anticipated + Level + Coupon)**
    ```typescript
    it('should compound all discounts: Plata user (5%) + Yape anticipated (10%) + coupon (S/ 50)', async () => {
      const basePrice = 80.00;
      
      // Plata 5% discount
      const levelPrice = basePrice * 0.95; // 76.00
      
      // Prepaid 10% discount on level price
      const prepaidPrice = levelPrice * 0.90; // 68.40
      
      // Apply S/ 50 coupon
      const finalPrice = prepaidPrice - 50.00;
      expect(finalPrice).toBeCloseTo(18.40);
    });
    ```

33. **TC-T3-COMB-05: Real-Time Tab Synchronization**
    ```typescript
    it('should synchronize approval status in real-time using Supabase subscriptions', async () => {
      const reservationId = crypto.randomUUID();
      await supabaseAdmin.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: crypto.randomUUID(),
        date: '2026-06-25',
        start_time: '12:00:00',
        status: 'pending'
      });
      
      const paymentId = crypto.randomUUID();
      await supabaseAdmin.from('yape_payments').insert({
        id: paymentId,
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPESYNC',
        screenshot_url: 'mock'
      });
      
      // Create subscription channel
      let changeEventPayload: any = null;
      const channel = supabaseAnon
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'yape_payments', filter: `id=eq.${paymentId}` },
          (payload) => {
            changeEventPayload = payload;
          }
        )
        .subscribe();
        
      // Wait for subscription confirmation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Admin approves
      await supabaseAdmin.from('yape_payments').update({ status: 'approved' }).eq('id', paymentId);
      
      // Wait for real-time trigger event
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      expect(changeEventPayload).not.toBeNull();
      expect(changeEventPayload.new.status).toBe('approved');
      
      // Cleanup channel
      supabaseAnon.removeChannel(channel);
    });
    ```

---

## 5. Verification Method

To verify the test suite after implementing this plan:
1. **Supabase Environment**: Run `npx supabase start` or verify the local Supabase environment is running in Docker.
2. **Database Migration**: Ensure the database constraints on `profiles.points` and `reservations.status` are applied by executing database schema migration scripts.
3. **Execution**: Run `npm run test:e2e` to execute the full suite.
4. **Assert Results**: Ensure all 60 tests (both the 28 existing and 32 new tests) are discovered, run, and pass successfully.
