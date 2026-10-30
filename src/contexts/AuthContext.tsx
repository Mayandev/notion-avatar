import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { EMPTY_ACCOUNT } from '@/types/account';
import type { AccountState, AccountUser, AccountUsage } from '@/types/account';
import type { SubscriptionRow } from '@/lib/subscription';

interface AuthContextType {
  user: AccountUser | null;
  subscription: SubscriptionRow | null;
  credits: number;
  usage: AccountUsage | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    username: string,
    email: string,
    password: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchAccount({
  signal,
}: {
  signal?: AbortSignal;
}): Promise<AccountState> {
  const response = await fetch('/api/auth/session', {
    signal,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to load account');
  return response.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: account = EMPTY_ACCOUNT, isLoading } = useQuery<AccountState>({
    queryKey: ['accountState'],
    queryFn: fetchAccount,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
  const { user, subscription, credits, usage } = account;

  const refreshSubscription = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['accountState'] });
  }, [queryClient]);

  const signInWithGoogle = async () => {
    const savedRedirect =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('auth_redirect')
        : null;

    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '/';
    const localeMatch = pathname.match(/^\/(zh|zh-TW|ko|ja|es|fr|de|ru|pt)/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    const homePath = locale === 'en' ? '/' : `/${locale}`;

    let next = savedRedirect || homePath;
    if (!savedRedirect && pathname && !pathname.includes('/auth/login')) {
      next = pathname;
    }

    if (next.includes('/auth/login')) {
      next = homePath;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_redirect');
    }

    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'google', next }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else if (data.error) {
      throw new Error(data.error);
    }
  };

  const signInWithGithub = async () => {
    const savedRedirect =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('auth_redirect')
        : null;

    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '/';
    const localeMatch = pathname.match(/^\/(zh|zh-TW|ko|ja|es|fr|de|ru|pt)/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    const homePath = locale === 'en' ? '/' : `/${locale}`;

    let next = savedRedirect || homePath;
    if (!savedRedirect && pathname && !pathname.includes('/auth/login')) {
      next = pathname;
    }

    if (next.includes('/auth/login')) {
      next = homePath;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_redirect');
    }

    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'github', next }),
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else if (data.error) {
      throw new Error(data.error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.error) {
        return { error: new Error(data.error) };
      }

      await queryClient.cancelQueries();
      queryClient.removeQueries({ queryKey: ['usageHistory'] });
      queryClient.removeQueries({ queryKey: ['purchasedPacks'] });
      await refreshSubscription();

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithEmail = async (
    username: string,
    email: string,
    password: string,
  ) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (data.error) {
        return { error: new Error(data.error) };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (!response.ok) throw new Error('Sign out failed');
      await queryClient.cancelQueries();
      queryClient.removeQueries({ queryKey: ['usageHistory'] });
      queryClient.removeQueries({ queryKey: ['purchasedPacks'] });
      queryClient.setQueryData(['accountState'], EMPTY_ACCOUNT);
    } catch {
      // Sign out failed silently
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        credits,
        usage,
        isLoading,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
