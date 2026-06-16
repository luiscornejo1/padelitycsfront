## 2026-06-16T17:40:05-05:00
You are teamwork_preview_worker.
Your working directory is: c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\worker_m2_remediation
Identity: Milestone 2 Remediation Worker

Task:
Improve the database migrations and configuration based on the reviewer's findings.

Detailed Steps:
1. Create a blank seed file:
   - Create `supabase/seed.sql` as an empty file so `config.toml` doesn't complain about it missing.
2. Update the migration file:
   - Read the existing migration file at `c:\Users\luisc\OneDrive\Escritorio\Padelitycs\supabase\migrations\20260616223500_init_schema.sql`.
   - Modify the migration schema to add the following constraints:
     - On `public.profiles`: Ensure `points >= 0` and `completed_reservations_count >= 0`.
     - On `public.coupons`: Add `CHECK (value > 0)`.
     - On `public.reservations`: Add `CHECK (end_time > start_time)`.
     - On `public.yape_payments`: Add `CHECK (amount > 0)`.
     - On `public.inscriptions`: Add `CHECK (category IN ('1era', '2da', '3ra', '4ta', '5ta', '6ta'))`.
     - On `public.products`: Add `CHECK (price >= 0)`, `CHECK (initial_stock >= 0)`, `CHECK (current_stock >= 0)`.
     - On `public.sales`: Add `CHECK (quantity > 0)` and `CHECK (revenue >= 0)`.
3. Verify that the build and tests still pass cleanly:
   - Run `npx vitest run src/lib/standingsLogic.test.ts`.
   - Run `npm run build`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please report back when complete by writing handoff.md in your working directory and sending me a message.
