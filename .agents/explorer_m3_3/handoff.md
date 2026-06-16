# Handoff Report

## 1. Observation
- **Database Schema**:
  - In `supabase/migrations/20260616223500_init_schema.sql` lines 5-15:
    ```sql
    CREATE TABLE public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        ...
        role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
        ...
    );
    ```
  - In the same migration file lines 87-97:
    ```sql
    CREATE TABLE public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        price NUMERIC NOT NULL CHECK (price >= 0),
        initial_stock INTEGER NOT NULL CHECK (initial_stock >= 0),
        current_stock INTEGER NOT NULL CHECK (current_stock >= 0),
        min_stock INTEGER NOT NULL,
        category TEXT,
        image TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
    );
    ```
  - In the same migration file lines 100-106:
    ```sql
    CREATE TABLE public.sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        revenue NUMERIC NOT NULL CHECK (revenue >= 0),
        created_at TIMESTAMPTZ DEFAULT now()
    );
    ```
- **Codebase Access**:
  - In `src/components/admin/InventoryPOSView.tsx` lines 18-25: products are stored in React state/local storage as `padel_inventory_products` with initial mock data.
  - In the same file lines 70-79 (inside `finishClosure`), the component updates the state of all products' `initialStock` and `currentStock` to match the physical input counts:
    ```typescript
    const updatedProducts = products.map(p => {
      const physical = physicalCounts[p.id] ?? p.initialStock;
      return {
        ...p,
        initialStock: physical,
        currentStock: physical
      };
    });
    setProducts(updatedProducts);
    ```
  - We ran grep searches for `products` and `sales` across `src/` and found no current direct Supabase queries, indicating they are still utilizing local/mock state or scheduled for future backend migration in upcoming milestones.

---

## 2. Logic Chain
1. **Recursion Risk**: 
   - An RLS policy on `public.profiles` that queries the `profiles` table directly or via a standard helper function triggers an infinite evaluation loop (recursion) when evaluating permissions for the select operation.
   - Using `SECURITY DEFINER` on a helper function forces the Postgres planner to run the query with the privileges of the function owner (`postgres`/superuser) rather than the invoking user.
   - This bypasses the RLS constraints on `public.profiles` for the queries within the function, breaking the evaluation cycle and preventing recursion.
2. **Access Scoping for `products`**:
   - The user request states "Players can view products, but only admins can modify them."
   - Standard players are authenticated users. Thus, `SELECT` should be permitted for all `authenticated` users (or public users if catalog viewing is anonymous).
   - Modification (`INSERT`, `UPDATE`, `DELETE`) must check `public.is_admin(auth.uid())`.
3. **Access Scoping for `sales`**:
   - The user request asks "Only admins can insert/modify sales (or players too?)".
   - Sales represent transactions and shift cash registers. Standard players do not perform checkout closures or view global sales logs. 
   - Therefore, access (including `SELECT`) is restricted to admin accounts only. All CRUD operations on `sales` are locked to `public.is_admin(auth.uid())`.
4. **Trigger Considerations**:
   - If a database trigger automatically decrements `current_stock` when a sale is logged, but the frontend also updates the product stock explicitly (as shown in `InventoryPOSView.tsx` where stock is set to physical count), it will cause double-decrementing of the stock.
   - Therefore, we recommend against an automatic database decrement trigger unless frontend logic is modified to only insert sales and stop manual stock updates.

---

## 3. Caveats
- This investigation is strictly read-only; no code modifications were applied.
- Assumed standard Supabase environment where migrations run as `postgres` (allowing `SECURITY DEFINER` to bypass RLS).
- Assumed that players/users are always logged in under the `authenticated` role when checking `auth.uid()`.

---

## 4. Conclusion
- A safe helper function `public.is_admin(user_id UUID)` must be created using `SECURITY DEFINER SET search_path = public, pg_temp;` to bypass RLS policies during execution and avoid infinite recursion.
- RLS policies must be applied to `public.products` (allowing public or authenticated `SELECT`, but admin-only modification) and `public.sales` (admin-only for all operations).
- A trigger on `sales` for stock decrementing should not be used if the frontend explicitly updates stock to a computed physical count during shift closures, as this will lead to double-decrementing stock.

---

## 5. Verification Method
1. Inspect the SQL proposed in `c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\explorer_m3_3\analysis.md`.
2. To verify recursion safety:
   - Apply the `is_admin()` helper function to a test database and use it in a `profiles` RLS policy.
   - Run a `SELECT` query on the `profiles` table as a standard user and as an admin. The queries should succeed without throwing an infinite recursion or stack overflow error.
3. To verify RLS policies:
   - Perform authenticated requests with a player JWT and an admin JWT to check that:
     - Player can view products but gets permission denied when executing insert/update/delete.
     - Admin can perform all operations on both products and sales.
     - Player gets permission denied when selecting or inserting into sales.
