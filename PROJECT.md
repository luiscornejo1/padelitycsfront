# Project: Padelitycs Supabase Migration

## Architecture
- Backend: Local Supabase running in Docker.
- Database: PostgreSQL with schemas for profiles, reservations, yape_payments.
- Frontend: React TypeScript, Vite.
- Auth: Supabase Auth (Email, Google Auth).
- State Management: Replace localStorage with Supabase real-time queries and subscriptions.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Exploration & Mapping | Explore current codebase, map tables, state, auth, and identify all files to modify. | None | DONE |
| 2 | Supabase Backend Setup | Initialize Supabase, configure Docker, write DB schema migrations. | M1 | DONE |
| 3 | RLS Implementation | Write DB migrations to implement strict Row Level Security policies. | M2 | IN_PROGRESS |
| 4 | Authentication & Routing | Implement Supabase Auth in frontend, setup routes based on user roles. | M2 | PLANNED |
| 5 | Real-time Frontend | Migrate TournamentContext & state from localStorage to Supabase real-time. | M3, M4 | PLANNED |
| 6 | Verification & Hardening | Write RLS validation script, run full build/test, verify security, clean secrets. | M5 | PLANNED |

## Interface Contracts
### Database Schema ↔ Frontend
- Profiles: { id: uuid, points: integer, role: text, email: text, full_name: text }
- Reservations: { id: uuid, user_id: uuid, court_id: uuid, date: date, start_time: time, end_time: time, status: text }
- Yape Payments: { id: uuid, reservation_id: uuid, user_id: uuid, amount: numeric, status: text, transaction_code: text, created_at: timestamptz }

## Code Layout
- Frontend Source: `src/`
- Supabase Config: `supabase/`
