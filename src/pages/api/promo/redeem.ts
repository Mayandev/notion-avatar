import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// 固定的 Promo codes 配置
// 可根据需要添加或修改促销码
const MAX_REDEMPTIONS_PER_CODE = 20;

const PROMO_CODES: Record<string, { credits: number; expiresAt: Date | null }> =
  {
    XKZQWM: { credits: 10, expiresAt: new Date('2026-01-31') },
    PLRTYN: { credits: 10, expiresAt: new Date('2026-01-31') },
    VBNMGH: { credits: 10, expiresAt: new Date('2026-01-31') },
  };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(req, res);
    const serviceClient = createServiceClient();

    // 验证用户登录状态
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Invalid promo code' });
    }

    // 转换为大写进行匹配
    const normalizedCode = code.trim().toUpperCase();

    // 检查 code 是否存在
    const promoConfig = PROMO_CODES[normalizedCode];
    if (!promoConfig) {
      return res.status(400).json({ error: 'Invalid promo code' });
    }

    // 检查是否过期
    if (promoConfig.expiresAt && new Date() > promoConfig.expiresAt) {
      return res.status(400).json({ error: 'Promo code has expired' });
    }

    // 检查用户是否已兑换过此码
    const { data: existingRedemption } = await serviceClient
      .from('promo_redemptions')
      .select('id')
      .eq('user_id', userId)
      .eq('promo_code', normalizedCode)
      .single();

    if (existingRedemption) {
      return res.status(400).json({ error: 'Promo code already redeemed' });
    }

    // 检查该 promo code 的全局兑换次数是否已达上限
    const { count: totalRedemptions } = await serviceClient
      .from('promo_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('promo_code', normalizedCode);

    if (
      totalRedemptions !== null &&
      totalRedemptions >= MAX_REDEMPTIONS_PER_CODE
    ) {
      return res
        .status(400)
        .json({ error: 'Promo code redemption limit reached' });
    }

    // 插入 credit_packages 记录
    const { error: creditError } = await serviceClient
      .from('credit_packages')
      .insert({
        user_id: userId,
        credits_purchased: promoConfig.credits,
        credits_remaining: promoConfig.credits,
        stripe_payment_intent_id: `promo_${normalizedCode}_${Date.now()}`,
      });

    if (creditError) {
      console.error('Credit insert error:', creditError);
      return res.status(500).json({ error: 'Failed to add credits' });
    }

    // 记录兑换历史
    const { error: redemptionError } = await serviceClient
      .from('promo_redemptions')
      .insert({
        user_id: userId,
        promo_code: normalizedCode,
        credits_awarded: promoConfig.credits,
      });

    if (redemptionError) {
      console.error('Redemption record error:', redemptionError);
      // 即使记录失败，credits 已经添加成功，所以仍返回成功
    }

    return res.status(200).json({
      success: true,
      credits: promoConfig.credits,
      message: `Successfully redeemed ${promoConfig.credits} credits!`,
    });
  } catch (error) {
    console.error('Promo redeem error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
