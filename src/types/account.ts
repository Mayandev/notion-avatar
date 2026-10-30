import type { SubscriptionRow } from '@/lib/subscription';

export interface AccountUser {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
  };
}

export interface AccountUsage {
  date: string;
  remaining: number;
  total: number;
  isUnlimited: boolean;
  freeRemaining: number;
  paidCredits: number;
  planType: string;
}

export interface AccountState {
  user: AccountUser | null;
  subscription: SubscriptionRow | null;
  credits: number;
  usage: AccountUsage | null;
}

export const EMPTY_ACCOUNT: AccountState = {
  user: null,
  subscription: null,
  credits: 0,
  usage: null,
};
