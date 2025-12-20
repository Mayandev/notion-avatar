import { useState, useEffect, useCallback } from 'react';
import { AIUsageState } from '@/types/ai';

const STORAGE_KEY = 'ai_avatar_usage';
// Increase limit for development/testing
const FREE_DAILY_LIMIT = process.env.NODE_ENV === 'development' ? 1000 : 1;

export function useAIUsage() {
  const [usageState, setUsageState] = useState<AIUsageState>({
    remaining: 0,
    total: FREE_DAILY_LIMIT,
    isUnlimited: false,
  });

  const checkLimit = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const usage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    // Reset if new day
    if (usage.date !== today) {
      setUsageState({
        remaining: FREE_DAILY_LIMIT,
        total: FREE_DAILY_LIMIT,
        isUnlimited: false,
      });
      return;
    }

    setUsageState({
      remaining: Math.max(0, FREE_DAILY_LIMIT - (usage.count || 0)),
      total: FREE_DAILY_LIMIT,
      isUnlimited: false,
    });
  }, []);

  useEffect(() => {
    checkLimit();
  }, [checkLimit]);

  const incrementUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const usage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    const newCount = usage.date === today ? (usage.count || 0) + 1 : 1;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        date: today,
        count: newCount,
      }),
    );

    checkLimit();
  };

  return { usageState, incrementUsage, checkLimit };
}
