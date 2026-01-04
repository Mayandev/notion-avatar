-- =====================================================
-- Promo Code Redemptions Table
-- =====================================================

-- promo_redemptions 表: 记录用户兑换历史
CREATE TABLE IF NOT EXISTS public.promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code TEXT NOT NULL,
  credits_awarded INTEGER NOT NULL DEFAULT 10,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, promo_code)  -- 每个用户每个码只能兑换一次
);

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_user_id ON public.promo_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_promo_code ON public.promo_redemptions(promo_code);

-- =====================================================
-- Enable Row Level Security
-- =====================================================
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for promo_redemptions
-- =====================================================
DROP POLICY IF EXISTS "Users can view own redemptions" ON public.promo_redemptions;
CREATE POLICY "Users can view own redemptions" ON public.promo_redemptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all redemptions" ON public.promo_redemptions;
CREATE POLICY "Service role can manage all redemptions" ON public.promo_redemptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

