-- Enable UUID generator extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    completed_reservations_count INTEGER DEFAULT 0 CHECK (completed_reservations_count >= 0),
    level TEXT DEFAULT 'bronce' CHECK (level IN ('bronce', 'plata', 'oro')),
    role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
    code TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    value NUMERIC NOT NULL CHECK (value > 0),
    type TEXT NOT NULL CHECK (type IN ('discount', 'credit_virtual', 'free_court')),
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    court_id TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    CHECK (end_time > start_time)
);

-- Create yape_payments table
CREATE TABLE public.yape_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    transaction_code TEXT NOT NULL,
    screenshot_url TEXT NOT NULL,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tournaments table
CREATE TABLE public.tournaments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    format TEXT CHECK (format IN ('americano', 'mexicano', 'romano', 'personalizado', 'mic_padel_league', 'fase_de_grupos')),
    status TEXT NOT NULL,
    courts INTEGER NOT NULL,
    pairs INTEGER NOT NULL,
    num_groups INTEGER,
    category TEXT CHECK (category IN ('1era', '2da', '3ra', '4ta', '5ta', '6ta')),
    rotation_rule TEXT CHECK (rotation_rule IN ('equitativo', 'rey_de_cancha')),
    time_elapsed TEXT,
    participants JSONB DEFAULT '[]'::jsonb,
    bracket_results JSONB DEFAULT '{}'::jsonb,
    bracket_participants JSONB DEFAULT '[]'::jsonb,
    bracket_size INTEGER,
    fixture JSONB DEFAULT '[]'::jsonb,
    match_scores JSONB DEFAULT '{}'::jsonb,
    current_round INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create inscriptions table
CREATE TABLE public.inscriptions (
    id TEXT PRIMARY KEY,
    tournament_id INTEGER REFERENCES public.tournaments(id) ON DELETE CASCADE,
    p1_name TEXT NOT NULL,
    p2_name TEXT,
    category TEXT NOT NULL CHECK (category IN ('1era', '2da', '3ra', '4ta', '5ta', '6ta')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reserved')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table
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

-- Create sales table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    revenue NUMERIC NOT NULL CHECK (revenue >= 0),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create trigger function to automatically insert a profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        new.email,
        'player'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger function to the auth.users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
