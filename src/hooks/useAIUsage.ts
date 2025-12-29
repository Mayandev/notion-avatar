import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface AIUsageState {
  remaining: number;
  total: number;
  isUnlimited: boolean;
  freeRemaining?: number;
  paidCredits?: number;
  planType?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const FREE_DAILY_LIMIT = 1;
const STORAGE_KEY = 'ai_avatar_usage_guest';

export function useAIUsage() {
  const { user } = useAuth();
  const [usageState, setUsageState] = useState<AIUsageState>({
    remaining: 0,
    total: FREE_DAILY_LIMIT,
    isUnlimited: false,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkUsage = useCallback(async () => {
    if (user) {
      // Authenticated user - fetch from API
      try {
        const response = await fetch('/api/usage/check');
        const data = await response.json();

        setUsageState({
          remaining: data.remaining,
          total: data.total,
          isUnlimited: data.isUnlimited,
          freeRemaining: data.freeRemaining,
          paidCredits: data.paidCredits,
          planType: data.planType,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to check usage:', error);
        setUsageState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      // Guest user - use localStorage
      const today = new Date().toISOString().split('T')[0];
      const usage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

      if (usage.date !== today) {
        // Reset for new day
        setUsageState({
          remaining: FREE_DAILY_LIMIT,
          total: FREE_DAILY_LIMIT,
          isUnlimited: false,
          isAuthenticated: false,
          isLoading: false,
        });
      } else {
        setUsageState({
          remaining: Math.max(0, FREE_DAILY_LIMIT - (usage.count || 0)),
          total: FREE_DAILY_LIMIT,
          isUnlimited: false,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }
  }, [user]);

  useEffect(() => {
    checkUsage();
  }, [checkUsage]);

  const incrementUsage = async () => {
    if (user) {
      // For authenticated users, usage is tracked on the server
      // Just refresh the usage state
      await checkUsage();
    } else {
      // For guest users, update localStorage
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

      await checkUsage();
    }
  };

  return { usageState, incrementUsage, checkUsage };
}
