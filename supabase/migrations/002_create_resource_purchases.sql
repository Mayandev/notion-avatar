-- =====================================================
-- Resource Purchases Table
-- =====================================================

-- Create resource_purchases table
CREATE TABLE IF NOT EXISTS public.resource_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_pack_id TEXT NOT NULL, -- 'design-pack' or 'scribbles-pack'
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_resource_purchases_user_id ON public.resource_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_purchases_pack_id ON public.resource_purchases(resource_pack_id);
CREATE INDEX IF NOT EXISTS idx_resource_purchases_user_pack ON public.resource_purchases(user_id, resource_pack_id);

-- =====================================================
-- Enable Row Level Security
-- =====================================================
ALTER TABLE public.resource_purchases ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for resource_purchases
-- =====================================================
DROP POLICY IF EXISTS "Users can view own purchases" ON public.resource_purchases;
CREATE POLICY "Users can view own purchases" ON public.resource_purchases
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all purchases" ON public.resource_purchases;
CREATE POLICY "Service role can manage all purchases" ON public.resource_purchases
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

