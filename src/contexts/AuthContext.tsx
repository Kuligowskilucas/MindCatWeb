'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { AUTH_EXPIRED_EVENT } from '@/lib/http';
import type { Role, User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  /** true enquanto a checagem inicial de sessão não terminou. */
  initializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function homeFor(role: Role): string {
  switch (role) {
    case 'pro':     return '/pro';
    case 'admin':   return '/admin';
    case 'patient':
    default:        return '/hoje';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Checagem inicial: existe sessão válida?
  useEffect(() => {
    let cancelled = false;

    authApi
      .me()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sessão morreu no meio do uso (401 vindo de qualquer request).
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      queryClient.clear();
      router.replace('/login?expirou=1');
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [queryClient, router]);

  const login = useCallback(async (email: string, password: string) => {
    await authApi.login(email, password);
    const me = await authApi.me();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; role: Role }) => {
      await authApi.register(data);
      const me = await authApi.me();
      setUser(me);
      return me;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      queryClient.clear();
      router.replace('/login');
    }
  }, [queryClient, router]);

  const refresh = useCallback(async () => {
    try {
      setUser(await authApi.me());
    } catch {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, refresh }),
    [user, initializing, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}