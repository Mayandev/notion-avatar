import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
  };
}

interface Subscription {
  id: string;
  status: string;
  plan_type: string;
  current_period_end: string | null;
  cancel_at_period_end?: boolean;
}

interface SubscriptionData {
  subscription: Subscription | null;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  credits: number;
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

async function fetchSession(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session');
    const data = await response.json();
    return data.user || null;
  } catch {
    return null;
  }
}

async function fetchSubscriptionData(): Promise<SubscriptionData> {
  try {
    const response = await fetch('/api/user/subscription');
    if (response.ok) {
      const data = await response.json();
      return {
        subscription: data.subscription || null,
        credits: data.credits || 0,
      };
    }
    return { subscription: null, credits: 0 };
  } catch {
    return { subscription: null, credits: 0 };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading: isLoadingUser } = useQuery<User | null>(
    {
      queryKey: ['session'],
      queryFn: fetchSession,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  );

  const {
    data: subscriptionData = { subscription: null, credits: 0 },
    isLoading: isLoadingSubscription,
  } = useQuery<SubscriptionData>({
    queryKey: ['subscription'],
    queryFn: fetchSubscriptionData,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const isLoading = isLoadingUser || (!!user && isLoadingSubscription);

  const refreshSubscription = async () => {
    if (user) {
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });
    }
  };

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

      await queryClient.invalidateQueries({ queryKey: ['session'] });
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });

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
      await fetch('/api/auth/signout', {
        method: 'POST',
      });

      queryClient.setQueryData(['session'], null);
      queryClient.setQueryData(['subscription'], {
        subscription: null,
        credits: 0,
      });
    } catch {
      // Sign out failed silently
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription: subscriptionData.subscription,
        credits: subscriptionData.credits,
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
