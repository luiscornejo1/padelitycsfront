# Scope: Milestone 2: Supabase Backend Setup & Database Schema

## Architecture
- Backend: Local Supabase running in Docker.
- Database: PostgreSQL with tables mapped from frontend TypeScript interfaces and contexts.
- Code Layout: Migrations will reside in `supabase/migrations/`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| 1 | Init Supabase | Initialize Supabase config in workspace root. | None | DONE |
| 2 | Start Docker Stack | Start the local Supabase container services using docker. | M1 | DONE |
| 3 | Create Migrations | Write SQL files defining schemas, keys, constraints, defaults, and helper functions/triggers. | M2 | DONE |
| 4 | Apply and Verify | Run migrations on the local database and verify they apply cleanly and run without error. | M3 | DONE |

## Interface Contracts
### profiles
- id: uuid (references auth.users)
- full_name: text
- phone: text
- points: integer (default 0)
- completed_reservations_count: integer (default 0)
- level: text (check constraint: 'bronce', 'plata', 'oro')
- role: text (default 'player', can be 'admin')
- email: text

### coupons
- code: text (PK)
- user_id: uuid (references profiles)
- value: numeric
- type: text (check constraint: 'discount', 'credit_virtual', 'free_court')
- is_used: boolean (default false)
- created_at: timestamptz

### reservations
- id: uuid (PK)
- user_id: uuid (references profiles)
- court_id: text
- date: date
- start_time: time
- end_time: time
- status: text (check: 'pending', 'approved', 'rejected')

### yape_payments
- id: uuid (PK)
- reservation_id: uuid (references reservations)
- user_id: uuid (references profiles)
- amount: numeric
- status: text (check: 'pending', 'approved', 'rejected')
- transaction_code: text
- screenshot_url: text
- rejection_reason: text
- created_at: timestamptz

### tournaments
- id: serial (PK) or integer (PK)
- name: text
- format: text (check: 'americano', 'mexicano', 'romano', 'personalizado', 'mic_padel_league', 'fase_de_grupos')
- status: text
- courts: integer
- pairs: integer
- num_groups: integer
- category: text (check: '1era', '2da', '3ra', '4ta', '5ta', '6ta')
- rotation_rule: text (check: 'equitativo', 'rey_de_cancha')
- time_elapsed: text
- participants: jsonb
- bracket_results: jsonb
- bracket_participants: jsonb
- bracket_size: integer
- fixture: jsonb
- match_scores: jsonb
- current_round: integer

### inscriptions
- id: text (PK)
- tournament_id: integer (references tournaments)
- p1_name: text
- p2_name: text
- category: text
- status: text (check: 'pending', 'approved', 'rejected', 'reserved')
- created_at: timestamptz

### products
- id: uuid (PK) or text (PK)
- name: text
- price: numeric
- initial_stock: integer
- current_stock: integer
- min_stock: integer
- category: text
- image: text

### sales
- id: uuid (PK)
- product_id: uuid or text (references products)
- quantity: integer
- revenue: numeric
- created_at: timestamptz
