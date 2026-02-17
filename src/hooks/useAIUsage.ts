import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getWeekStart } from '@/lib/date';

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

const FREE_WEEKLY_LIMIT = 1;
const STORAGE_KEY = 'ai_avatar_usage_guest';

function getGuestUsage(): AIUsageState {
  if (typeof window === 'undefined') {
    return {
      remaining: FREE_WEEKLY_LIMIT,
      total: FREE_WEEKLY_LIMIT,
      isUnlimited: false,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  const weekStart = getWeekStart();
  const usage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  if (usage.weekStart !== weekStart) {
    return {
      remaining: FREE_WEEKLY_LIMIT,
      total: FREE_WEEKLY_LIMIT,
      isUnlimited: false,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  return {
    remaining: Math.max(0, FREE_WEEKLY_LIMIT - (usage.count || 0)),
    total: FREE_WEEKLY_LIMIT,
    isUnlimited: false,
    isAuthenticated: false,
    isLoading: false,
  };
}

async function fetchUsageCheck(): Promise<AIUsageState> {
  const response = await fetch('/api/usage/check');
  const data = await response.json();

  return {
    remaining: data.remaining,
    total: data.total,
    isUnlimited: data.isUnlimited,
    freeRemaining: data.freeRemaining,
    paidCredits: data.paidCredits,
    planType: data.planType,
    isAuthenticated: true,
    isLoading: false,
  };
}

export function useAIUsage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: usageState, isLoading } = useQuery<AIUsageState>({
    queryKey: ['usageCheck', !!user],
    queryFn: async () => {
      if (user) {
        return fetchUsageCheck();
      }
      return getGuestUsage();
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const defaultState: AIUsageState = {
    remaining: 0,
    total: FREE_WEEKLY_LIMIT,
    isUnlimited: false,
    isAuthenticated: !!user,
    isLoading: true,
  };

  const checkUsage = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['usageCheck'] });
  }, [queryClient]);

  const incrementUsage = useCallback(async () => {
    if (user) {
      await checkUsage();
    } else {
      const weekStart = getWeekStart();
      const usage = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const newCount =
        usage.weekStart === weekStart ? (usage.count || 0) + 1 : 1;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          weekStart,
          count: newCount,
        }),
      );

      await checkUsage();
    }
  }, [user, checkUsage]);

  return {
    usageState: usageState || { ...defaultState, isLoading },
    incrementUsage,
    checkUsage,
  };
}
