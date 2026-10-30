-- Apply before deploying the generation handler. Only the service role may
-- reserve/finish work; untrusted clients cannot change their own allowance.
CREATE TABLE public.avatar_generation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id uuid NOT NULL,
  source text NOT NULL CHECK (source IN ('free', 'credit', 'pro')),
  usage_date date NOT NULL,
  credit_package_id uuid REFERENCES public.credit_packages(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '15 minutes',
  finished_at timestamptz,
  UNIQUE (user_id, request_id)
);
CREATE UNIQUE INDEX avatar_generation_one_in_flight
  ON public.avatar_generation_requests(user_id) WHERE status = 'reserved';
CREATE INDEX avatar_generation_credit_package
  ON public.avatar_generation_requests(credit_package_id) WHERE credit_package_id IS NOT NULL;
ALTER TABLE public.avatar_generation_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.avatar_generation_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.avatar_generation_requests TO service_role;

CREATE FUNCTION public.finish_avatar_generation(
  p_user_id uuid, p_reservation_id uuid, p_success boolean,
  p_mode text DEFAULT NULL, p_image_path text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  r public.avatar_generation_requests%ROWTYPE;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  SELECT * INTO r FROM public.avatar_generation_requests
    WHERE id = p_reservation_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown generation reservation'; END IF;
  -- Completion/refund is idempotent, including retries after a network timeout.
  IF r.status <> 'reserved' THEN RETURN jsonb_build_object('status', r.status); END IF;
  IF p_success THEN
    IF p_mode IS NULL OR p_mode NOT IN ('photo2avatar', 'text2avatar') THEN
      RAISE EXCEPTION 'Invalid generation mode';
    END IF;
    IF p_image_path IS NOT NULL AND p_image_path NOT LIKE p_user_id::text || '/%' THEN
      RAISE EXCEPTION 'Invalid image owner';
    END IF;
    INSERT INTO public.usage_records(id, user_id, generation_mode, input_type, image_path)
      VALUES (r.id, p_user_id, p_mode, CASE WHEN p_mode = 'photo2avatar' THEN 'image' ELSE 'text' END, p_image_path);
    UPDATE public.avatar_generation_requests SET status = 'completed', finished_at = now() WHERE id = r.id;
    RETURN jsonb_build_object('status', 'completed');
  END IF;
  IF r.source = 'free' THEN
    UPDATE public.daily_usage SET count = greatest(count - 1, 0)
      WHERE user_id = p_user_id AND usage_date = r.usage_date;
  ELSIF r.source = 'credit' THEN
    UPDATE public.credit_packages SET credits_remaining = credits_remaining + 1
      WHERE id = r.credit_package_id AND user_id = p_user_id;
  END IF;
  UPDATE public.avatar_generation_requests SET status = 'failed', finished_at = now() WHERE id = r.id;
  RETURN jsonb_build_object('status', 'failed');
END;
$$;
REVOKE ALL ON FUNCTION public.finish_avatar_generation(uuid, uuid, boolean, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_avatar_generation(uuid, uuid, boolean, text, text) TO service_role;

CREATE FUNCTION public.reserve_avatar_generation(
  p_user_id uuid, p_request_id uuid, p_free_limit integer DEFAULT 1
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  r public.avatar_generation_requests%ROWTYPE;
  v_source text;
  v_credit_id uuid;
  v_count integer;
  v_date date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  IF p_user_id IS NULL OR p_request_id IS NULL OR p_free_limit < 0 OR p_free_limit IS NULL THEN
    RAISE EXCEPTION 'Invalid reservation parameters';
  END IF;
  -- One short database transaction per user. No lock is held during model I/O.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  FOR r IN SELECT * FROM public.avatar_generation_requests
    WHERE user_id = p_user_id AND status = 'reserved' AND expires_at <= now()
  LOOP
    PERFORM public.finish_avatar_generation(p_user_id, r.id, false);
  END LOOP;
  SELECT * INTO r FROM public.avatar_generation_requests WHERE user_id = p_user_id AND request_id = p_request_id;
  IF FOUND THEN RETURN jsonb_build_object('status', 'duplicate'); END IF;
  IF EXISTS (SELECT 1 FROM public.avatar_generation_requests WHERE user_id = p_user_id AND status = 'reserved') THEN
    RETURN jsonb_build_object('status', 'busy');
  END IF;
  IF EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = p_user_id
    AND status = 'active' AND plan_type IN ('monthly', 'yearly') AND current_period_end >= now()) THEN
    v_source := 'pro';
  ELSE
    INSERT INTO public.daily_usage(user_id, usage_date, count) VALUES (p_user_id, v_date, 0)
      ON CONFLICT (user_id, usage_date) DO NOTHING;
    SELECT count INTO v_count FROM public.daily_usage WHERE user_id = p_user_id AND usage_date = v_date FOR UPDATE;
    IF v_count < p_free_limit THEN
      v_source := 'free';
      UPDATE public.daily_usage SET count = count + 1 WHERE user_id = p_user_id AND usage_date = v_date;
    ELSE
      SELECT id INTO v_credit_id FROM public.credit_packages WHERE user_id = p_user_id AND credits_remaining > 0
        ORDER BY purchased_at, id LIMIT 1 FOR UPDATE;
      IF NOT FOUND THEN RETURN jsonb_build_object('status', 'limit'); END IF;
      v_source := 'credit';
      UPDATE public.credit_packages SET credits_remaining = credits_remaining - 1 WHERE id = v_credit_id;
    END IF;
  END IF;
  INSERT INTO public.avatar_generation_requests(user_id, request_id, source, usage_date, credit_package_id)
    VALUES (p_user_id, p_request_id, v_source, v_date, v_credit_id) RETURNING * INTO r;
  RETURN jsonb_build_object('status', 'reserved', 'id', r.id, 'isPaid', v_source IN ('credit', 'pro'));
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_avatar_generation(uuid, uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_avatar_generation(uuid, uuid, integer) TO service_role;
