## 2026-06-16T22:44:37Z
You are the Worker subagent.
Your working directory is: c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\worker_m3
Your parent is: Milestone 3 Sub-Orchestrator (conversation ID: 9aaf86c4-0345-4486-8119-929c1fd91734)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your tasks:
1. Write the RLS policies and triggers into a new migration file: `supabase/migrations/20260616224000_rls_policies.sql`.
Use the provided SQL schema.
2. After writing the migration file, push/apply the migrations to the local database.
3. Run the Vitest unit tests: `npx vitest run src/lib/standingsLogic.test.ts`.
4. Run the frontend build: `npm run build`.
5. Run the E2E tests: `npm run test:e2e` to verify that RLS is correctly enforced and the entire flow works!
6. Document your findings, build outputs, and test logs in `c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\worker_m3\handoff.md`.
Send a completion message when you are done.
