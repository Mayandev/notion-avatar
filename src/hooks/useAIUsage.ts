import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getToday, FREE_DAILY_LIMIT } from '@/lib/date';

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
const STORAGE_KEY = 'ai_avatar_usage_guest';

function getGuestUsage(): AIUsageState {
  if (typeof window === 'undefined') {
    return {
      remaining: FREE_DAILY_LIMIT,
      total: FREE_DAILY_LIMIT,
      isUnlimited: false,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  const today = getToday();
  const usage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  if (usage.date !== today) {
    return {
      remaining: FREE_DAILY_LIMIT,
      total: FREE_DAILY_LIMIT,
      isUnlimited: false,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  return {
    remaining: Math.max(0, FREE_DAILY_LIMIT - (usage.count || 0)),
    total: FREE_DAILY_LIMIT,
    isUnlimited: false,
    isAuthenticated: false,
    isLoading: false,
  };
}

export function useAIUsage() {
  const {
    user,
    usage: accountUsage,
    isLoading: isLoadingAccount,
    refreshSubscription,
  } = useAuth();
  const queryClient = useQueryClient();
  const { data: guestUsage } = useQuery<AIUsageState>({
    queryKey: ['guestUsage', getToday()],
    queryFn: getGuestUsage,
    enabled: !user && !isLoadingAccount,
    staleTime: 1000 * 60 * 2,
  });
  const usageState =
    user && accountUsage
      ? { ...accountUsage, isAuthenticated: true, isLoading: false }
      : guestUsage || {
          remaining: FREE_DAILY_LIMIT,
          total: FREE_DAILY_LIMIT,
          isUnlimited: false,
          isAuthenticated: false,
          isLoading: false,
        };

  const checkUsage = useCallback(async () => {
    if (user) await refreshSubscription();
    else await queryClient.invalidateQueries({ queryKey: ['guestUsage'] });
  }, [queryClient, user, refreshSubscription]);

  const incrementUsage = useCallback(async () => {
    if (user) {
      await checkUsage();
    } else {
      const today = getToday();
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
  }, [user, checkUsage]);

  return {
    usageState: { ...usageState, isLoading: isLoadingAccount },
    incrementUsage,
    checkUsage,
  };
}
