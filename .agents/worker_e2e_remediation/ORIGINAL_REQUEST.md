## 2026-06-16T22:39:57Z
Implement all 32 missing E2E tests in `tests/e2e/` to bring the total test cases to 60, matching the documentation in `TEST_INFRA.md`. Additionally, fix the database schema constraints.

Steps:
1. Edit `supabase/migrations/20260616223500_init_schema.sql` to update schema constraints:
   - In `public.profiles`, add a CHECK constraint on `points`:
     `points INTEGER DEFAULT 0 CHECK (points >= 0),`
   - In `public.reservations`, update the CHECK constraint on `status` to allow 'confirmed' and 'cancelled':
     `status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'cancelled')),`
2. Update the E2E test files in `tests/e2e/`:
   - `auth.test.ts`: Implement TC-T1-LOGIN-05, TC-T1-ROUTE-04, TC-T1-ROUTE-05, TC-T2-EMPTY-01, TC-T2-EMAIL-01, TC-T2-EMAIL-02, TC-T2-EMAIL-03, TC-T2-EMAIL-04, TC-T2-EMAIL-05, and TC-T2-RLS-03.
   - `bookings.test.ts`: Implement TC-T1-YAPE-02, TC-T1-YAPE-05, TC-T2-EMPTY-02, TC-T2-EMPTY-05, and TC-T2-RLS-01.
   - `admin.test.ts`: Implement TC-T1-APPROVAL-01, TC-T1-APPROVAL-02, TC-T2-EMPTY-03, TC-T2-EMPTY-04, TC-T2-POINTS-01, TC-T2-POINTS-02, TC-T2-POINTS-03, TC-T2-RLS-04, TC-T2-RLS-05, TC-T2-TRANS-01, TC-T2-TRANS-02, TC-T2-TRANS-03, TC-T2-TRANS-04, and TC-T2-TRANS-05.
   - `coupons.test.ts`: Implement TC-T1-COUPON-01, TC-T1-COUPON-04, and TC-T1-COUPON-05.
   - `scenarios.test.ts`: Implement the remaining combination tests (TC-T3-COMB-01, TC-T3-COMB-03, TC-T3-COMB-04, and TC-T3-COMB-05). Ensure the file contains the other happy path scenario tests.
3. Verify if local Supabase Docker container is running. If not, start it (e.g. `npx supabase start` or `supabase start`). Apply migration changes by executing `npx supabase db reset` or `supabase db reset`.
4. Run `npm run test:e2e` to verify that all 60 tests execute and pass successfully. Ensure no tests are skipped or missing.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write a handoff report in c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\worker_e2e_remediation\handoff.md when done.
