# Database Schema & RLS Policy Analysis Report

## Executive Summary
This report analyzes the database schema and codebase usage patterns for `yape_payments`, `tournaments`, and `inscriptions` to propose robust PostgreSQL Row Level Security (RLS) policies and triggers. 

### Key Findings
1. **`yape_payments`**: Standard users only view and create their own payment requests. All modifications (approving, rejecting) are restricted to admin roles. Furthermore, completed payments (status `'approved'` or `'rejected'`) cannot be reverted back to `'pending'`.
2. **`tournaments`**: Public/players can read tournaments, but only admins can create, update, or delete them.
3. **`inscriptions`**: Inscriptions are verified to be **admin-only** for modification (INSERT, UPDATE, DELETE). Standard players currently do not submit inscriptions directly in the frontend (registration is done by admins via `AmericanoDetailView.tsx`). Public/players can read inscriptions for viewing.

---

## 1. Codebase Access Patterns

We analyzed the frontend codebase (`src/`) and test suites (`tests/e2e/`) to understand how these tables are accessed.

| Table | Read Access (SELECT) | Write/Edit Access (INSERT/UPDATE/DELETE) | Codebase Location / Notes |
|---|---|---|---|
| `yape_payments` | Standard User & Admin | **Insert**: Standard User & Admin<br>**Update**: Admin Only (Transitions status) | Checked in `tests/e2e/admin.test.ts` & `scenarios.test.ts`. Admin transitions status to `'approved'`/`'rejected'`. Player inserts `'pending'` payments. |
| `tournaments` | Public (Anonymous & Player) | Admin Only | Accessed in frontend via mocked `localStorage` for now. No direct standard user modification in frontend. |
| `inscriptions` | Public (Anonymous & Player) | Admin Only | Only references to adding inscriptions are in `src/components/admin/AmericanoDetailView.tsx` (via context helper `addInscriptionToTournament`). No player registration component exists. |

---

## 2. SQL RLS Policies & Triggers Proposal

To secure these tables, we propose the following SQL statements, which include a helper security-definer function `is_admin()`, RLS policies for each table, and a state transition validation trigger for `yape_payments`.

### 2.1 Helper Functions
We define a helper function `is_admin()` with `SECURITY DEFINER` to check the current user's role from `public.profiles` without triggering RLS infinite recursion.

```sql
-- Helper function to check if the current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2.2 Table 1: `yape_payments` RLS & Trigger

Standard users can view and create their own payment requests. They cannot update status to `'approved'` or `'rejected'`, nor can they revert status back to `'pending'` (enforced by a trigger).

```sql
-- Enable Row Level Security
ALTER TABLE public.yape_payments ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT
-- Standard users can read their own payments; admins can read all
CREATE POLICY yape_payments_select_policy ON public.yape_payments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- Policy: INSERT
-- Standard users can insert their own payments with status 'pending' (or null); admins can insert any
CREATE POLICY yape_payments_insert_policy ON public.yape_payments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (auth.uid() = user_id AND (status IS NULL OR status = 'pending'))
        OR public.is_admin()
    );

-- Policy: UPDATE
-- Only admins can update payment records
CREATE POLICY yape_payments_update_policy ON public.yape_payments
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- Policy: DELETE
-- Only admins can delete payment records
CREATE POLICY yape_payments_delete_policy ON public.yape_payments
    FOR DELETE
    TO authenticated
    USING (public.is_admin());
```

#### Transition Validation Trigger
To satisfy the E2E test constraint where an approved payment cannot be reverted back to pending (even by `supabaseAdmin` client bypassing RLS), we propose a database trigger:

```sql
-- Trigger function to enforce payment status transition rules
CREATE OR REPLACE FUNCTION public.check_yape_payment_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changes from approved/rejected back to pending, raise an exception
    IF OLD.status IN ('approved', 'rejected') AND NEW.status = 'pending' THEN
        RAISE EXCEPTION 'Cannot revert a finalized payment status (approved/rejected) back to pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind the transition validation trigger
CREATE TRIGGER trg_check_yape_payment_transition
    BEFORE UPDATE OF status ON public.yape_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.check_yape_payment_transition();
```

---

### 2.3 Table 2: `tournaments` RLS

Public/anonymous users and standard players can read tournaments. Only admins can write, edit, or delete.

```sql
-- Enable Row Level Security
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT
-- Anyone (including anonymous users) can view tournaments
CREATE POLICY tournaments_select_policy ON public.tournaments
    FOR SELECT
    TO public
    USING (true);

-- Policy: INSERT
-- Only admins can create tournaments
CREATE POLICY tournaments_insert_policy ON public.tournaments
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Policy: UPDATE
-- Only admins can modify tournaments
CREATE POLICY tournaments_update_policy ON public.tournaments
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- Policy: DELETE
-- Only admins can delete tournaments
CREATE POLICY tournaments_delete_policy ON public.tournaments
    FOR DELETE
    TO authenticated
    USING (public.is_admin());
```

---

### 2.4 Table 3: `inscriptions` RLS

Public/anonymous users and standard players can read inscriptions. Only admins can insert, update, or delete.

```sql
-- Enable Row Level Security
ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT
-- Anyone can view inscriptions
CREATE POLICY inscriptions_select_policy ON public.inscriptions
    FOR SELECT
    TO public
    USING (true);

-- Policy: INSERT
-- Only admins can insert inscriptions (standard users do not insert directly)
CREATE POLICY inscriptions_insert_policy ON public.inscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Policy: UPDATE
-- Only admins can update inscriptions
CREATE POLICY inscriptions_update_policy ON public.inscriptions
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- Policy: DELETE
-- Only admins can delete inscriptions
CREATE POLICY inscriptions_delete_policy ON public.inscriptions
    FOR DELETE
    TO authenticated
    USING (public.is_admin());
```
