# Scope: Milestone 3 - RLS Implementation

## Architecture
- Enable Row Level Security (RLS) on all public tables: `profiles`, `coupons`, `reservations`, `yape_payments`, `tournaments`, `inscriptions`, `products`, `sales`.
- Helper function `public.is_admin()` using `SECURITY DEFINER` to safely check if `auth.uid()` has `role = 'admin'` in `public.profiles` (to avoid infinite recursion in policies).
- Standard users (players):
  - `profiles`: Select/update own profile data. But `points` and `role` must not be modifiable by non-admins (can be enforced via a `BEFORE UPDATE` trigger on `profiles` that resets `NEW.points = OLD.points` and `NEW.role = OLD.role` if the user is not an admin, or similar policy/trigger logic).
  - `coupons`: Can only view their own coupons (`user_id = auth.uid()`). No insert/update/delete for standard users.
  - `reservations`: Can only view and modify (or create/view/update/delete depending on requirements, but user request says "view their own coupons and reservations", wait, can they create reservations? Yes, players create reservations, but standard users can only view their own coupons and reservations, and let's check if they can insert reservations. Typically yes, players can create reservations. Let's check requirements or existing tests to be precise).
  - `yape_payments`: Can only view and create their own `yape_payments` requests (`user_id = auth.uid()`), and cannot update the status of any payment request to "approved" or "rejected" (only admins can do this). We can enforce status updates via a `BEFORE UPDATE` trigger or policy constraints.
  - `tournaments`: Read-only.
  - `inscriptions`: Read-only. (Wait, can players create inscriptions? Let's check requirements: "Public or players can read tournaments and inscriptions for viewing, but only admins can modify them." If only admins can modify them, can players create/insert inscriptions? Let's verify if players can register. The prompt says "Public or players can read tournaments and inscriptions for viewing, but only admins can modify them." "Modify" usually implies UPDATE/DELETE, but sometimes INSERT as well. Let's make sure the explorer checks if there is any frontend page or code where standard users write to `inscriptions` or if it's done via admin or client side. We should inspect the codebase to see how these tables are updated/inserted).
  - `products`: View only (select).
  - `sales`: No access or read-only? "Players can view products, but only admins can modify products or insert sales." This means players cannot insert sales.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | M3.1: Analysis and Policy Design | Explorer analyzes codebase to verify how tables are used, then designs RLS policies | none | DONE |
| 2 | M3.2: RLS Policy Implementation | Worker implements policies in `supabase/migrations/20260616224000_rls_policies.sql`, verifies database, builds and runs unit tests | M3.1 | IN_PROGRESS |
| 3 | M3.3: Review and Verification | Reviewer checks policies, Challenger runs verification, Forensic Auditor verifies integrity | M3.2 | PLANNED |

## Interface Contracts
- Helper function `public.is_admin(user_id UUID) RETURNS boolean` and `public.is_admin() RETURNS boolean`
- Helper function `public.get_user_role(user_id UUID) RETURNS text`
- Trigger `tr_profiles_before_update` on `profiles` to guard `points`, `role`, `completed_reservations_count`, `level`
- Trigger `tr_coupons_before_insert` on `coupons` to validate and deduct points (minimum 100 points balance required)
- Trigger `tr_reservations_before_update` on `reservations` to prevent non-admins from altering core booking details and restrict status updates to `'cancelled'` only
- Trigger `tr_yape_payments_transitions` on `yape_payments` to enforce that `'approved'` or `'rejected'` states cannot transition back to `'pending'`
- Migration file to write: `supabase/migrations/20260616224000_rls_policies.sql`
- Add `id UUID UNIQUE` to `coupons` table if missing to support E2E tests.
