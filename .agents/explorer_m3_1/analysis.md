# Database RLS Policies and Triggers Analysis

## Executive Summary
This analysis establishes the Row Level Security (RLS) policies and triggers required to secure the `profiles`, `coupons`, and `reservations` tables, ensuring standard players cannot modify restricted data (such as points, roles, and reservations details) while allowing them to view and manage their own records.

---

## Codebase Database Interaction Analysis
Through a search of the codebase, we determined the following patterns of database access:
1. **Frontend Application (`src/`)**: The React frontend is a prototype that maintains its state client-side using `localStorage` (via `useLocalStorage` and `TournamentContext`). It does not query Supabase directly.
2. **E2E Integration Tests (`tests/e2e/`)**: The Vitest E2E test suite actively queries Supabase. It uses:
   - `supabaseAdmin` (utilizing the service role key) to setup tests, simulate admin approvals, and manually adjust user points/roles.
   - `playerClient` (utilizing standard user JWTs) to simulate player activities (inserting reservations, applying and updating coupons, updating profiles, and making yape payments).

---

## RLS Recursion Gotcha & Helper Function
To define policies for admin operations on standard tables without creating infinite recursion (which occurs when a policy on `profiles` queries `profiles` itself), we define a `SECURITY DEFINER` helper function. This function executes with the creator's privileges (postgres) and bypasses RLS on the `profiles` table:

```sql
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Table-by-Table Analysis & Proposals

### 1. `profiles` Table

#### Requirements
- Standard users can select/update their own profile data.
- Standard users MUST NOT be able to modify `points` or `role`.

#### Trigger vs. Constraint Analysis
- **Constraints (e.g. CHECK constraints)** are static and apply to all rows regardless of the executing user context. They cannot compare `OLD` and `NEW` records, nor can they dynamically read session data (like `auth.uid()` or `auth.role()`) safely.
- **RLS policies** cannot compare `OLD` and `NEW` versions of a row during an update (the `WITH CHECK` clause only sees the new state).
- **BEFORE UPDATE Triggers** are the ideal solution. They have access to both `OLD` and `NEW` records, can check session variables, and can selectively revert changes to restricted columns (like `points`, `role`, `completed_reservations_count`, and `level`) for standard users while letting allowed columns (like `full_name`, `phone`) update successfully.

#### SQL Policies & Trigger Proposal

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can view their own profile, admins can view all profiles
CREATE POLICY select_profile_policy ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id 
        OR 
        public.get_my_role() = 'admin'
    );

-- UPDATE policy: Users can update their own profile, admins can update all profiles
CREATE POLICY update_profile_policy ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = id 
        OR 
        public.get_my_role() = 'admin'
    )
    WITH CHECK (
        auth.uid() = id 
        OR 
        public.get_my_role() = 'admin'
    );

-- Trigger to protect restricted columns (points, role, completed_reservations_count, level)
CREATE OR REPLACE FUNCTION public.clean_profile_updates()
RETURNS TRIGGER AS $$
DECLARE
    v_caller_role TEXT;
BEGIN
    -- Only enforce restrictions for standard authenticated users
    IF (auth.role() = 'authenticated') THEN
        v_caller_role := public.get_my_role();
        
        -- If caller is not an admin, revert changes to restricted fields
        IF (v_caller_role IS NULL OR v_caller_role != 'admin') THEN
            NEW.role := OLD.role;
            NEW.points := OLD.points;
            NEW.completed_reservations_count := OLD.completed_reservations_count;
            NEW.level := OLD.level;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_profiles_before_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.clean_profile_updates();
```

---

### 2. `coupons` Table

#### Requirements
- Standard users can only view their own coupons.
- Standard users can insert coupons for themselves when redeeming points (exchanging 100 points).
- Standard users can mark their coupons as used (`is_used := true`).

#### Trigger & Points Deduction Logic
When a player inserts a coupon, the database must verify that they have at least 100 points, and automatically deduct 100 points. If points are insufficient, the insert must be rejected.

#### SQL Policies & Trigger Proposal

```sql
-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can only view their own coupons, admins can view all
CREATE POLICY select_coupons_policy ON public.coupons
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    );

-- INSERT policy: Users can create coupons for themselves, admins can create for all
CREATE POLICY insert_coupons_policy ON public.coupons
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    );

-- UPDATE policy: Users can update their own coupons (marking as used), admins can update all
CREATE POLICY update_coupons_policy ON public.coupons
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    );

-- Trigger to validate points balance and perform auto-deduction
CREATE OR REPLACE FUNCTION public.handle_coupon_redemption()
RETURNS TRIGGER AS $$
DECLARE
    v_user_points INTEGER;
BEGIN
    -- Only enforce points check for standard authenticated users
    IF (auth.role() = 'authenticated') THEN
        -- Get current points of the user
        SELECT points INTO v_user_points FROM public.profiles WHERE id = NEW.user_id;

        -- Check if points are sufficient (minimum 100 points required)
        IF v_user_points IS NULL OR v_user_points < 100 THEN
            RAISE EXCEPTION 'Insufficient points for coupon redemption. Minimum 100 points required.'
                USING ERRCODE = '42501'; -- Map to standard Postgres permission error
        END IF;

        -- Deduct 100 points from user's profile
        UPDATE public.profiles
        SET points = points - 100
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_coupons_before_insert
    BEFORE INSERT ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_coupon_redemption();
```

---

### 3. `reservations` Table

#### Requirements
- Standard users can only view and create their own reservations.
- Standard users can update their own reservations (specifically to transition the status to `'cancelled'`). They must not be able to modify core booking details (date, times, court) or transition status to `'confirmed'`.

#### SQL Policies & Trigger Proposal

```sql
-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can view their own reservations, admins can view all
CREATE POLICY select_reservations_policy ON public.reservations
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    );

-- INSERT policy: Users can create reservations for themselves, admins can create for all
CREATE POLICY insert_reservations_policy ON public.reservations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    );

-- UPDATE policy: Users can update their own reservations (for cancellation), admins can update all
CREATE POLICY update_reservations_policy ON public.reservations
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    );

-- Trigger to prevent standard users from tampering with booking details or self-confirming
CREATE OR REPLACE FUNCTION public.clean_reservation_updates()
RETURNS TRIGGER AS $$
DECLARE
    v_caller_role TEXT;
BEGIN
    IF (auth.role() = 'authenticated') THEN
        v_caller_role := public.get_my_role();
        
        -- If caller is not an admin, restrict modification capability
        IF (v_caller_role IS NULL OR v_caller_role != 'admin') THEN
            -- Check if they tried to modify immutable booking details
            IF NEW.court_id IS DISTINCT FROM OLD.court_id OR
               NEW.date IS DISTINCT FROM OLD.date OR
               NEW.start_time IS DISTINCT FROM OLD.start_time OR
               NEW.end_time IS DISTINCT FROM OLD.end_time OR
               NEW.user_id IS DISTINCT FROM OLD.user_id OR
               NEW.id IS DISTINCT FROM OLD.id OR
               NEW.created_at IS DISTINCT FROM OLD.created_at THEN
                RAISE EXCEPTION 'You are not allowed to modify core reservation details.'
                    USING ERRCODE = '42501';
            END IF;

            -- Check if they modified status and ensure they only transition to 'cancelled'
            IF NEW.status IS DISTINCT FROM OLD.status THEN
                IF NEW.status != 'cancelled' THEN
                    RAISE EXCEPTION 'You are not allowed to change reservation status to %.', NEW.status
                        USING ERRCODE = '42501';
                END IF;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_reservations_before_update
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.clean_reservation_updates();
```

---

### Bonus: `yape_payments` Table State Transitions

#### Requirements
- E2E tests require that once a payment request is approved or rejected, its status cannot transition back to pending.

#### SQL Policies & Trigger Proposal

```sql
-- Enable RLS
ALTER TABLE public.yape_payments ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users view their own payment status, admins view all
CREATE POLICY select_yape_payments_policy ON public.yape_payments
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    );

-- INSERT policy: Users can submit payment requests for themselves
CREATE POLICY insert_yape_payments_policy ON public.yape_payments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        public.get_my_role() = 'admin'
    );

-- Trigger to enforce state transition immutability once approved or rejected
CREATE OR REPLACE FUNCTION public.check_yape_payment_transitions()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
        RAISE EXCEPTION 'Cannot modify an approved payment.'
            USING ERRCODE = '42501';
    END IF;

    IF OLD.status = 'rejected' AND NEW.status != 'rejected' THEN
        RAISE EXCEPTION 'Cannot modify a rejected payment.'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_yape_payments_transitions
    BEFORE UPDATE ON public.yape_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.check_yape_payment_transitions();
```
