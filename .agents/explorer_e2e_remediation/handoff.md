# Handoff Report: E2E Test Suite Remediation Plan

## 1. Observation
- The Forensic Auditor reported an integrity violation: `TEST_READY.md` and `TEST_INFRA.md` claim 60 E2E tests are implemented and ready to run, but the Vitest test suite only defines 28 test cases.
- We examined `tests/e2e/` and found 5 test files (`auth.test.ts`, `bookings.test.ts`, `admin.test.ts`, `coupons.test.ts`, `scenarios.test.ts`) and 1 helper file (`helpers.ts`).
- Counting the actual test cases (`it` blocks) in the files yields exactly 28 tests:
  - `auth.test.ts`: 10 tests
  - `bookings.test.ts`: 5 tests
  - `admin.test.ts`: 5 tests
  - `coupons.test.ts`: 3 tests
  - `scenarios.test.ts`: 5 tests
- We inspected `supabase/migrations/20260616223500_init_schema.sql` and observed the following:
  - The `profiles` table has no `CHECK (points >= 0)` constraint (line 9).
  - The `reservations` table has status constraint: `CHECK (status IN ('pending', 'approved', 'rejected'))` (line 35).
  - The tests (e.g. `admin.test.ts` line 77, 127) update reservations status to `'confirmed'` and `'cancelled'`, which violates the PostgreSQL check constraint.

## 2. Logic Chain
- Since the total target test count is 60 and only 28 are implemented, exactly 32 test cases are missing.
- By mapping the 28 existing test cases to the 60 target cases defined in `TEST_INFRA.md`, we identified exactly which test cases are implemented (either fully or loosely) and which 32 are completely missing.
- Since the local Supabase environment is not running during the test runs, the tests fail with `ECONNREFUSED`. A running local database is a prerequisite for executing the E2E tests.
- Since the database schema has mismatching constraints (lack of `points >= 0` check and restricted reservation statuses of `pending`, `approved`, `rejected` instead of allowing `confirmed` and `cancelled`), the tests would fail database validation checks even if the database were running.
- Therefore, the remediation plan must:
  1. Boot the Supabase Docker container environment.
  2. Correct database schema constraints (points floor and reservation status validation).
  3. Implement the 32 missing tests in the existing files as detailed in the design plan.

## 3. Caveats
- No test execution was performed because this is a read-only investigation.
- We assume that the Docker and Supabase CLI tools are properly installed and configured on the host machine.
- We assume that the frontend application code will be updated by the implementing agent in tandem with the test cases.

## 4. Conclusion
- The Forensic Auditor's verdict of `INTEGRITY VIOLATION` is verified and correct.
- A comprehensive remediation plan detailing the gap analysis, schema fixes, and concrete Vitest designs for all 32 missing tests has been successfully saved to `c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\explorer_e2e_remediation\analysis.md`.

## 5. Verification Method
- Ensure the local Supabase environment is started (`supabase start`).
- Apply the database migrations to correct schema mismatch constraints.
- Run `npm run test:e2e` and verify that all 60 tests are executed and pass.
