# Handoff Report - Database Schema and RLS Policies Analysis

## 1. Observation
- **Database Schema**: Located in `supabase/migrations/20260616223500_init_schema.sql`.
  - `public.profiles` has: `id UUID PRIMARY KEY REFERENCES auth.users(id)`, `points INTEGER DEFAULT 0 CHECK (points >= 0)`, `role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin'))`.
  - `public.coupons` has: `code TEXT PRIMARY KEY`, `user_id UUID REFERENCES public.profiles(id)`, `value NUMERIC NOT NULL CHECK (value > 0)`, `type TEXT NOT NULL`, `is_used BOOLEAN DEFAULT false`.
  - `public.reservations` has: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `user_id UUID REFERENCES public.profiles(id)`, `court_id TEXT NOT NULL`, `date DATE NOT NULL`, `start_time TIME NOT NULL`, `end_time TIME NOT NULL`, `status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'cancelled'))`.
- **Codebase Access**:
  - The React source files in `src/` (e.g. `src/App.tsx`, `src/components/PadelCashPortal.tsx`, `src/context/TournamentContext.tsx`) maintain client-side mock states in `localStorage` and do not communicate directly with Supabase.
  - The Vitest E2E test files in `tests/e2e/` (specifically `auth.test.ts`, `bookings.test.ts`, `coupons.test.ts`, and `scenarios.test.ts`) perform genuine database interactions using Supabase clients:
    - Standard player operations are executed via `playerClient` (which includes standard user JWT authorization header).
    - Administrative and setup operations are executed via `supabaseAdmin` (which uses the privileged `service_role` key to bypass RLS).
  - Running `npm run test:e2e` fails with `ECONNREFUSED` error code, indicating that the local database containers are not running:
    ```
    tiple (node:net:1791:7) {
        code: 'ECONNREFUSED',
        [errors]: [ [Error], [Error] ]
    }
    ```
  - E2E tests assert standard user security boundaries:
    - `auth.test.ts` line 143: `should prevent standard players from updating their own points balance arbitrarily`
    - `auth.test.ts` line 167: `should prevent standard players from modifying their own role to admin`
    - `coupons.test.ts` line 34: `should reject coupon redemption when player has less than 100 points`
    - `coupons.test.ts` line 70: `should allow coupon redemption and deduct points when player has exactly 100 points`
    - `coupons.test.ts` line 160: standard player can update coupon `is_used` status.
    - `scenarios.test.ts` line 153: standard player can cancel a reservation by setting `status = 'cancelled'`.

---

## 2. Logic Chain
1. **Goal**: Propose RLS policies and database constraints/triggers that prevent standard players from elevating their role, modifying their own points balance, viewing/tampering with other users' reservations/coupons, and self-approving bookings.
2. **Profiles Table Constraints vs. Triggers**:
   - A `CHECK` constraint on `profiles` runs on all inserts and updates, but it cannot compare the old value to the new value (e.g. detect if a value was modified) and cannot query the authentication session `auth.uid()` or user role without circular/recursive dependency.
   - An RLS `WITH CHECK` clause does not have access to the `OLD` version of the row, preventing it from verifying if a specific column (like `points` or `role`) was changed.
   - Therefore, a `BEFORE UPDATE` trigger is the only viable mechanism to dynamically check if a standard player is modifying a restricted field and revert it (or throw an exception). Overwriting changes to `OLD` values is preferred to prevent standard application payloads from throwing unexpected errors.
3. **RLS Policy Recursion Gotcha**:
   - When an RLS policy on `public.profiles` performs a subquery checking the caller's role in `public.profiles`, selecting from `profiles` fires RLS, which fires the subquery, triggering RLS again in an infinite loop.
   - Defining a `get_my_role()` helper function with `SECURITY DEFINER` executes with the owner's privileges, bypassing RLS inside the query and successfully resolving this recursion.
4. **Coupons Table Logic**:
   - Standard users need to insert coupons for themselves when exchanging points. A `BEFORE INSERT` trigger on `coupons` must check if `profiles.points >= 100`, raise an exception if insufficient, and automatically subtract 100 points from the user's profile upon success (which fulfills the E2E test's automatic point-deduction assertion).
5. **Reservations Table Logic**:
   - Standard users must be allowed to create reservations, view their own, and cancel their own bookings (`status = 'cancelled'`). However, they must not be allowed to self-confirm (`status = 'confirmed'`) or alter time slots. A `BEFORE UPDATE` trigger on `reservations` must enforce that standard users can *only* transition the status column to `'cancelled'` and cannot modify core reservation details.

---

## 3. Caveats
- The local Supabase Docker container environment was offline during this investigation (`ECONNREFUSED`), meaning the proposed SQL policies/triggers could not be applied or tested directly.
- The analysis assumes the application's E2E test suite acts as the authoritative spec for backend requirements, as the React frontend code is client-side mock-based.

---

## 4. Conclusion
- Standard CHECK constraints are insufficient to prevent standard players from updating their own points or role. A **BEFORE UPDATE trigger** is required.
- Infinite recursion in `profiles` RLS policies must be prevented using a `SECURITY DEFINER` role helper function.
- We have proposed the exact, ready-to-execute SQL script covering the helper function, RLS policies, and triggers for `profiles`, `coupons`, `reservations`, and `yape_payments`. The findings and full SQL proposal are saved in `c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\explorer_m3_1\analysis.md`.

---

## 5. Verification Method
1. **Inspect Analysis File**: View the proposals in `c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\explorer_m3_1\analysis.md`.
2. **Execute SQL Script**: Apply the proposed SQL script in the Supabase SQL editor or migration file.
3. **Run E2E Tests**: Spin up the local Supabase environment (e.g. `supabase start`) and run the test suite:
   ```bash
   npm run test:e2e
   ```
4. **Invalidation Conditions**: If any of the tests in `tests/e2e/auth.test.ts`, `coupons.test.ts`, or `bookings.test.ts` fail after applying the SQL script (under a running database context), the policies or triggers may need syntax or logic adjustment.
