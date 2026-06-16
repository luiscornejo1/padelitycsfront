-- ================================================================
-- MIGRATION: Row Level Security (RLS) Policies
-- ================================================================

-- Conceder permisos basicos a los roles de Supabase para evitar "permission denied"
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ----------------------------------------------------------------
-- FUNCION AUXILIAR PARA EVITAR RECURSION INFINITA
-- ----------------------------------------------------------------
-- Al ser SECURITY DEFINER, ejecuta como superusuario y no dispara RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------
-- PROFILES table RLS
-- ----------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "profiles_update_own_safe_fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ----------------------------------------------------------------
-- YAPE_PAYMENTS table RLS
-- ----------------------------------------------------------------
ALTER TABLE public.yape_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "yape_payments_select_own"
  ON public.yape_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "yape_payments_select_admin"
  ON public.yape_payments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "yape_payments_insert_own"
  ON public.yape_payments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

CREATE POLICY "yape_payments_update_admin_only"
  ON public.yape_payments FOR UPDATE
  USING (public.is_admin());

-- ----------------------------------------------------------------
-- RESERVATIONS table RLS
-- ----------------------------------------------------------------
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_select_own"
  ON public.reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "reservations_select_admin"
  ON public.reservations FOR SELECT
  USING (public.is_admin());

CREATE POLICY "reservations_insert_own"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservations_update_admin_only"
  ON public.reservations FOR UPDATE
  USING (public.is_admin());

-- ----------------------------------------------------------------
-- COUPONS table RLS
-- ----------------------------------------------------------------
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_select_own"
  ON public.coupons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "coupons_select_admin"
  ON public.coupons FOR SELECT
  USING (public.is_admin());

CREATE POLICY "coupons_insert_admin_only"
  ON public.coupons FOR INSERT
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------
-- TOURNAMENTS & INSCRIPTIONS table RLS
-- ----------------------------------------------------------------
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tournaments_select_public"
  ON public.tournaments FOR SELECT USING (true);

CREATE POLICY "tournaments_write_admin"
  ON public.tournaments FOR ALL
  USING (public.is_admin());

CREATE POLICY "inscriptions_select_public"
  ON public.inscriptions FOR SELECT USING (true);

CREATE POLICY "inscriptions_write_admin"
  ON public.inscriptions FOR ALL
  USING (public.is_admin());

-- ----------------------------------------------------------------
-- FUNCION SEGURA: Aprobar/Rechazar Pago
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.approve_yape_payment(payment_id UUID)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_amount NUMERIC;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: Solo administradores.';
  END IF;

  SELECT user_id, amount INTO v_user_id, v_amount
  FROM public.yape_payments
  WHERE id = payment_id AND status = 'pending';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Pago no encontrado o ya procesado.';
  END IF;

  UPDATE public.yape_payments SET status = 'approved' WHERE id = payment_id;

  UPDATE public.profiles
  SET
    points = points + 10,
    completed_reservations_count = completed_reservations_count + 1,
    level = CASE
      WHEN completed_reservations_count + 1 >= 20 THEN 'oro'
      WHEN completed_reservations_count + 1 >= 10 THEN 'plata'
      ELSE 'bronce'
    END
  WHERE id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reject_yape_payment(payment_id UUID, reason TEXT)
RETURNS void AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: Solo administradores.';
  END IF;

  UPDATE public.yape_payments
  SET status = 'rejected', rejection_reason = reason
  WHERE id = payment_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;