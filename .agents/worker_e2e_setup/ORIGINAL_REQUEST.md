## 2026-06-16T22:31:27Z

<USER_REQUEST>
Implement the E2E test suite for Padelitycs under tests/e2e/ using Vitest, targeting a local Docker-based Supabase instance.

Steps:
1. Create `TEST_INFRA.md` at the project root based on the template in instructions. Document the 60 E2E test cases across 4 Tiers.
2. Install `@supabase/supabase-js` to the project if not present.
3. Create the `tests/e2e/` folder.
4. Write the test suite files in `tests/e2e/` covering:
   - `helpers.ts`: Supabase Client setup, admin client (with service_role to seed/cleanup test data), and regular player client (anon/JWT) to verify RLS.
   - `auth.test.ts`: Email login, role routing (admin vs player), invalid logins, and Row Level Security (RLS) validation tests. Include testing that standard users cannot modify other users' profiles, points, or roles.
   - `bookings.test.ts`: Yape booking requests, pricing checks (10% discount for anticipated payment), pending status verification, and validation checks.
   - `admin.test.ts`: Admin booking approval and rejection workflows, manual points adjustment, and payment state transition validation.
   - `coupons.test.ts`: Coupon management, point-deduction boundaries (minimum 100 points to redeem), coupon creation, usage, and points cap limits.
   - `scenarios.test.ts`: Real-world scenarios (Loyalty cycle, refund & rebooking, double promotion, fraud rejection correction, double booking conflict).
5. Add a command in `package.json` under scripts: `"test:e2e": "vitest run tests/e2e"`.
6. Verify that running `npm run test:e2e` compiles and executes. Note that if Supabase local container is not yet started or migration is in-progress, the tests might fail to connect, which is expected. Make sure there are no compiler or typescript errors, and if Supabase is already running, run the tests to pass.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write a handoff report in c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\worker_e2e_setup\handoff.md when done.
</USER_REQUEST>
