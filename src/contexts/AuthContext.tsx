import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current session from API
  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        return true;
      }

      setUser(null);
      return false;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  // Fetch subscription info from API
  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setCredits(data.credits);
      } else {
        setSubscription(null);
        setCredits(0);
      }
    } catch {
      setSubscription(null);
      setCredits(0);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (user) {
      await fetchSubscription();
    }
  }, [user, fetchSubscription]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const hasSession = await fetchSession();
      if (hasSession) {
        await fetchSubscription();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchSession, fetchSubscription]);

  const signInWithGoogle = async () => {
    // Get the current page or saved redirect URL to redirect back after login
    const savedRedirect =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('auth_redirect')
        : null;

    // Get locale from pathname or default to 'en'
    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '/';
    const localeMatch = pathname.match(/^\/(zh|zh-TW|ko|ja|es|fr|de|ru|pt)/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    const homePath = locale === 'en' ? '/' : `/${locale}`;

    // Use saved redirect, or current pathname if not login page, or home
    let next = savedRedirect || homePath;
    if (!savedRedirect && pathname && !pathname.includes('/auth/login')) {
      next = pathname;
    }

    // If next is login page, redirect to home instead
    if (next.includes('/auth/login')) {
      next = homePath;
    }

    // Clear saved redirect
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
      // Redirect to OAuth provider
      window.location.href = data.url;
    } else if (data.error) {
      throw new Error(data.error);
    }
  };

  const signInWithGithub = async () => {
    // Get the current page or saved redirect URL to redirect back after login
    const savedRedirect =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('auth_redirect')
        : null;

    // Get locale from pathname or default to 'en'
    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : '/';
    const localeMatch = pathname.match(/^\/(zh|zh-TW|ko|ja|es|fr|de|ru|pt)/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    const homePath = locale === 'en' ? '/' : `/${locale}`;

    // Use saved redirect, or current pathname if not login page, or home
    let next = savedRedirect || homePath;
    if (!savedRedirect && pathname && !pathname.includes('/auth/login')) {
      next = pathname;
    }

    // If next is login page, redirect to home instead
    if (next.includes('/auth/login')) {
      next = homePath;
    }

    // Clear saved redirect
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
      // Redirect to OAuth provider
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

      // Refresh session after successful login
      await fetchSession();
      await fetchSubscription();

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

      setUser(null);
      setSubscription(null);
      setCredits(0);
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
