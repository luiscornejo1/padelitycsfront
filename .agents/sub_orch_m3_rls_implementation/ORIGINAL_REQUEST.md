# Original User Request

## Initial Request — 2026-06-16T17:41:27-05:00

Your working directory is: c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\sub_orch_m3_rls_implementation
Your identity: Milestone 3 Sub-Orchestrator
Your parent ID: 47c1167f-aeb2-42d8-878b-c25747b18100 / orchestrator (this conversation)

Task:
Decompose and execute Milestone 3: RLS Implementation.
1. Read the schema definition in `supabase/migrations/20260616223500_init_schema.sql` and requirements in `ORIGINAL_REQUEST.md`.
2. Spawn a Worker subagent to:
   - Enable Row Level Security (RLS) on all tables: `profiles`, `coupons`, `reservations`, `yape_payments`, `tournaments`, `inscriptions`, `products`, `sales`.
   - Write RLS policies ensuring that:
     - Standard users (players) can only select/update their own profile data (with the exception of `points` and `role`, which must only be modifiable by admins).
     - Standard users can only view their own coupons and reservations.
     - Standard users can only view and create their own `yape_payments` requests, and can NOT update the status of any payment request to "approved" or "rejected" (only admins can do this).
     - Admins (identified via user role check or JWT claims, but let's check `profiles.role = 'admin'` using security-definer helper functions if needed) have full read and write access to all tables.
     - Public or players can read `tournaments` and `inscriptions` for viewing, but only admins can modify them.
     - Players can view products, but only admins can modify products or insert sales.
   - Place these RLS policies in a new migration file (e.g., `supabase/migrations/20260616224000_rls_policies.sql`).
   - Run the Vitest unit tests (`npx vitest run src/lib/standingsLogic.test.ts`) and frontend build (`npm run build`) to ensure the codebase remains stable.
3. Establish your own BRIEFING.md and progress.md in your working directory. Track your iteration loops (Explorer -> Worker -> Reviewer).
4. Report back to the parent once Milestone 3 is complete.
