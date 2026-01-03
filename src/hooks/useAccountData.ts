import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UsageRecord {
  id: string;
  generation_mode: string;
  created_at: string;
  image_path?: string;
  image_url?: string;
}

interface UsageHistoryResponse {
  records: UsageRecord[];
}

interface PurchasedPacksResponse {
  packs: string[];
}

export function useUsageHistory(limit = 10, isPro = false) {
  const { user } = useAuth();

  return useQuery<UsageRecord[]>({
    queryKey: ['usageHistory', limit],
    queryFn: async () => {
      const response = await fetch(`/api/usage/history?limit=${limit}`);
      const data: UsageHistoryResponse = await response.json();
      return data.records || [];
    },
    enabled: !!user && isPro,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePurchasedPacks(initialData?: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<string[]>({
    queryKey: ['purchasedPacks'],
    queryFn: async () => {
      const response = await fetch('/api/resources/purchased');
      if (!response.ok) {
        return [];
      }
      const data: PurchasedPacksResponse = await response.json();
      return data.packs || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    initialData,
  });

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['purchasedPacks'] });
  }, [queryClient]);

  return {
    ...query,
    refetch,
  };
}
