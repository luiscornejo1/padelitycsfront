# Database Schema & Policy Analysis (Products, Sales, and Role Helpers)

This analysis evaluates the schema in `supabase/migrations/20260616223500_init_schema.sql` and the frontend codebase to design safe helper functions (avoiding infinite RLS recursion) and Row Level Security (RLS) policies for the `products` and `sales` tables.

---

## 1. Preventing Infinite Recursion in Role-Based RLS Policies

### The Problem of Infinite Recursion
In Supabase/PostgreSQL, when Row Level Security (RLS) is enabled on a table (e.g., `public.profiles`), any query querying that table triggers the RLS policy evaluation.
If the RLS policy itself contains a query referencing that same table (either directly or via a standard helper function), it triggers a nested evaluation of the policy. This leads to infinite recursion and a stack overflow error (e.g., `ERROR: infinite recursion detected in policy`).

For example, the following policy on `profiles` is **unsafe**:
```sql
-- UNSAFE POLICY: Causes infinite recursion!
CREATE POLICY "Profiles viewable by admins"
ON public.profiles
FOR SELECT
USING (
  role = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### The Solution: `SECURITY DEFINER` with Owner Privileges
To break the recursion chain, we must define the role-checking helper functions as `SECURITY DEFINER` and ensure they are created by a superuser (e.g. `postgres`, which is default in migrations). 
- A `SECURITY DEFINER` function executes with the permissions of the user who *defined* it, rather than the user who *invokes* it.
- Since the owner/definer of database migrations is `postgres`, the select statements inside the function bypass RLS completely.
- Consequently, querying `public.profiles` inside a `SECURITY DEFINER` function does not trigger the RLS policies of the `profiles` table.

### Hardening: `SET search_path`
To prevent search path hijacking attacks, any `SECURITY DEFINER` function must explicitly set a secure `search_path`. We use `SET search_path = public, pg_temp;`.

---

## 2. Proposed Helper Functions

We propose creating a general `public.get_user_role` helper and a boolean `public.is_admin` helper.

```sql
-- Helper to get a user's role safely bypassing RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;

  RETURN COALESCE(user_role, 'player');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Helper to check if a user is an admin (accepting user_id)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role(user_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Parameterless helper for policies to check the currently authenticated user
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
```

---

## 3. Row Level Security (RLS) Policies

### Table: `public.products`
**Requirement**: Players can view products, but only admins can modify them.
- **Select**: Allowed for all authenticated users (players/admins) or all public users depending on scope. We provide policies for both options.
- **Insert / Update / Delete**: Restricted to users where `public.is_admin(auth.uid())` is true.

```sql
-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Authenticated users can view products
CREATE POLICY "Allow select for authenticated users"
ON public.products
FOR SELECT
TO authenticated
USING (true);

-- (Alternative) 1b. SELECT: Anyone can view products (unauthenticated catalog page)
-- CREATE POLICY "Allow select for public"
-- ON public.products
-- FOR SELECT
-- TO public
-- USING (true);

-- 2. INSERT: Only admins can create new products
CREATE POLICY "Allow insert for admins"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- 3. UPDATE: Only admins can update products
CREATE POLICY "Allow update for admins"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 4. DELETE: Only admins can delete products
CREATE POLICY "Allow delete for admins"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));
```

---

### Table: `public.sales`
**Requirement**: Only admins can insert/modify sales.
- **Access Scope**: Sales are transactional records for Pro-Shop inventory and shift closures. Players do not need to read or write sales directly. Therefore, all operations on `sales` are restricted to admins.

```sql
-- Enable Row Level Security
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Granular Policies for Sales

-- 1. SELECT: Only admins can view sales records
CREATE POLICY "Allow select for admins"
ON public.sales
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 2. INSERT: Only admins can insert sales records (e.g. during POS shift closures)
CREATE POLICY "Allow insert for admins"
ON public.sales
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- 3. UPDATE: Only admins can update sales records
CREATE POLICY "Allow update for admins"
ON public.sales
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 4. DELETE: Only admins can delete sales records
CREATE POLICY "Allow delete for admins"
ON public.sales
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));
```

---

## 4. Trigger Analysis: Inventory Stock Management

In the frontend codebase (`src/components/admin/InventoryPOSView.tsx`), stock counts and shift closures are managed.
- **Physical Count Closure**: During a shift closure, the admin inputs physical counts. The frontend calculates the difference (`missing = initial_stock - physical`), calculates the revenue, and updates the products' `initialStock` and `currentStock` to match the physical count.
- **Sales Logging**: Under the full integration, the frontend will log a record in `sales` for each product with `quantity = missing`.

### Trigger Consideration: Automatic Stock Decrement on Sale
We could implement a database trigger to decrement `current_stock` when a sale is inserted:
```sql
CREATE OR REPLACE FUNCTION public.handle_sale_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET current_stock = current_stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER on_sale_inserted
  AFTER INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.handle_sale_insert();
```

**⚠️ Integration Risk**:
If the frontend component updates the product's `current_stock` manually (as it currently does by setting it to the physical count) AND inserts a sale record, having the database trigger enabled will result in **double-decrementing** the stock. 
*Recommendation*: The database trigger should only be used if the frontend delegates stock updates entirely to the backend upon sale insertion. Since the UI currently calculates physical counts and sets both `initialStock` and `currentStock` directly to the counts, the safest design is to let the admin client update the product stock directly (guarded by admin-only update policy) and record sales separately without an automatic database decrement trigger, or adjust the frontend logic accordingly.
