# Original User Request

## Initial Request — 2026-06-16T17:26:41-05:00

Migrate the Padelitycs local prototype to a production-ready full-stack application using the Supabase CLI (Docker) for the backend. Implement secure authentication (Google Auth, Email, or SMS), enforce strict Row Level Security (RLS) policies, and ensure no hardcoded secrets or sensitive logic exist on the client side.

Working directory: c:\Users\luisc\OneDrive\Escritorio\Padelitycs
Integrity mode: development

## Requirements

### R1. Backend Infrastructure via Supabase CLI
Initialize and run the local Supabase environment using `supabase init` and `supabase start`. Set up the PostgreSQL schema for the core features (profiles, yape_payments, reservations). 

### R2. Strict Row Level Security (RLS)
Implement RLS policies in the database migrations. The policies must explicitly prevent standard users from modifying another user's data, altering their own `points` balance arbitrarily, or changing a `yape_payment` status to `approved`.

### R3. Authentication Integration
Integrate Supabase Auth into the frontend. Support at least Google Auth and Email/Password or SMS. Ensure the application routes correctly based on the user's role (Admin vs Player).

### R4. Real-time Frontend Migration
Remove all usage of `localStorage` for financial/reservation state (e.g., in `TournamentContext`). Replace it with Supabase client queries and real-time subscriptions so the UI updates instantly when an admin approves a payment.

## Acceptance Criteria

### Security Verification (Objective)
- [ ] A dedicated verification script (e.g., using Node.js or Vitest) is provided and successfully runs to prove that RLS works. The script must attempt to bypass security (e.g., log in as a standard user and attempt to UPDATE a yape_payment to "approved") and successfully receive a database rejection/error.
- [ ] No hardcoded tokens, secret keys, or mock passwords exist in the application source code.

### Functional Implementation
- [ ] The local Supabase Docker stack runs without errors.
- [ ] Users can register, log in, and see their real data fetched from PostgreSQL.
- [ ] The Padel-Cash portal and Admin dashboard operate using real Supabase API calls.
