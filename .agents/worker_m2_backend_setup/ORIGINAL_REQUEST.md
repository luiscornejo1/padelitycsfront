## 2026-06-16T22:30:00Z
You are teamwork_preview_worker.
Your working directory is: c:\Users\luisc\OneDrive\Escritorio\Padelitycs\.agents\worker_m2_backend_setup
Identity: Milestone 2 Backend Setup Worker

Task:
Initialize Supabase and set up the database schema for the Padelitycs application in the workspace root c:\Users\luisc\OneDrive\Escritorio\Padelitycs.

Detailed Steps:
1. Initialize Supabase:
   - Run `supabase init` in the workspace root.
   - Run `supabase start` to spin up the local Docker-based Supabase stack.
   - Verify that all services start and run successfully.
2. Create migrations:
   - Generate a migration file using `supabase db diff` or `supabase migration new init_schema`.
   - Write the PostgreSQL schema in the migration file to define the following tables:
     - `profiles`: Linked to auth.users. Columns:
       - `id` (uuid PRIMARY KEY REFERENCES auth.users)
       - `full_name` (text)
       - `phone` (text)
       - `points` (integer, default 0)
       - `completed_reservations_count` (integer, default 0)
       - `level` (text, check constraint: 'bronce', 'plata', 'oro', default 'bronce')
       - `role` (text, check constraint: 'player', 'admin', default 'player')
       - `email` (text)
       - `created_at` (timestamptz default now())
     - `coupons`:
       - `code` (text PRIMARY KEY)
       - `user_id` (uuid REFERENCES profiles(id) ON DELETE CASCADE)
       - `value` (numeric NOT NULL)
       - `type` (text, check constraint: 'discount', 'credit_virtual', 'free_court')
       - `is_used` (boolean, default false)
       - `created_at` (timestamptz default now())
     - `reservations`:
       - `id` (uuid PRIMARY KEY DEFAULT gen_random_uuid())
       - `user_id` (uuid REFERENCES profiles(id) ON DELETE CASCADE)
       - `court_id` (text NOT NULL)
       - `date` (date NOT NULL)
       - `start_time` (time NOT NULL)
       - `end_time` (time NOT NULL)
       - `status` (text, check constraint: 'pending', 'approved', 'rejected', default 'pending')
       - `created_at` (timestamptz default now())
     - `yape_payments`:
       - `id` (uuid PRIMARY KEY DEFAULT gen_random_uuid())
       - `reservation_id` (uuid REFERENCES reservations(id) ON DELETE CASCADE)
       - `user_id` (uuid REFERENCES profiles(id) ON DELETE CASCADE)
       - `amount` (numeric NOT NULL)
       - `status` (text, check constraint: 'pending', 'approved', 'rejected', default 'pending')
       - `transaction_code` (text NOT NULL)
       - `screenshot_url` (text NOT NULL)
       - `rejection_reason` (text)
       - `created_at` (timestamptz default now())
     - `tournaments`:
       - `id` (serial PRIMARY KEY)
       - `name` (text NOT NULL)
       - `format` (text, check constraint: 'americano', 'mexicano', 'romano', 'personalizado', 'mic_padel_league', 'fase_de_grupos')
       - `status` (text NOT NULL)
       - `courts` (integer NOT NULL)
       - `pairs` (integer NOT NULL)
       - `num_groups` (integer)
       - `category` (text, check constraint: '1era', '2da', '3ra', '4ta', '5ta', '6ta')
       - `rotation_rule` (text, check constraint: 'equitativo', 'rey_de_cancha')
       - `time_elapsed` (text)
       - `participants` (jsonb default '[]'::jsonb)
       - `bracket_results` (jsonb default '{}'::jsonb)
       - `bracket_participants` (jsonb default '[]'::jsonb)
       - `bracket_size` (integer)
       - `fixture` (jsonb default '[]'::jsonb)
       - `match_scores` (jsonb default '{}'::jsonb)
       - `current_round` (integer)
       - `created_at` (timestamptz default now())
     - `inscriptions`:
       - `id` (text PRIMARY KEY)
       - `tournament_id` (integer REFERENCES tournaments(id) ON DELETE CASCADE)
       - `p1_name` (text NOT NULL)
       - `p2_name` (text)
       - `category` (text NOT NULL)
       - `status` (text, check constraint: 'pending', 'approved', 'rejected', 'reserved', default 'pending')
       - `created_at` (timestamptz default now())
     - `products`:
       - `id` (uuid PRIMARY KEY DEFAULT gen_random_uuid())
       - `name` (text NOT NULL)
       - `price` (numeric NOT NULL)
       - `initial_stock` (integer NOT NULL)
       - `current_stock` (integer NOT NULL)
       - `min_stock` (integer NOT NULL)
       - `category` (text)
       - `image` (text)
       - `created_at` (timestamptz default now())
     - `sales`:
       - `id` (uuid PRIMARY KEY DEFAULT gen_random_uuid())
       - `product_id` (uuid REFERENCES products(id) ON DELETE CASCADE)
       - `quantity` (integer NOT NULL)
       - `revenue` (numeric NOT NULL)
       - `created_at` (timestamptz default now())
3. Setup automation Triggers:
   - Create a trigger/function to automatically insert a profile when a new user signs up (auth.users).
     Example trigger:
     ```sql
     create function public.handle_new_user()
     returns trigger as $$
     begin
       insert into public.profiles (id, full_name, email, role)
       values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), new.email, 'player');
       return new;
     end;
     $$ language plpgsql security definer;
     create trigger on_auth_user_created
       after insert on auth.users
       for each row execute procedure public.handle_new_user();
     ```
   - Do NOT implement Row Level Security (RLS) policies yet (RLS will be handled in Milestone 3). Ensure all tables exist.
4. Run/Verify:
   - Apply migrations to the local database.
   - Run checks or queries to ensure they applied cleanly.
   - Run tests (npx vitest run and npm run build) to confirm frontend build remains stable.
