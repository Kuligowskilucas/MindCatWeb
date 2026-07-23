'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { accountApi } from '@/lib/api/account';
import { setAccessToken } from '@/lib/authToken';
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
  deleteAccount: () => Promise<void>;
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

const AUTH_HINT_COOKIE = process.env.NEXT_PUBLIC_AUTH_COOKIE ?? 'mindcat_auth';

/**
 * Cookie-dica de autenticação, LEGÍVEL pelo middleware.
 *
 * Por que não usar o mindcat_session direto: o Laravel cria a sessão (e planta
 * o cookie) em qualquer request stateful, inclusive pra visitante não-logado
 * (/me, /sanctum/csrf-cookie). Então a presença do mindcat_session NÃO prova
 * que o usuário está logado — e o middleware, ao tratá-la assim, criava um
 * loop /login -> /hoje -> /login.
 *
 * Este cookie é escrito só quando o /me confirma um usuário e apagado no
 * logout/expiração/exclusão. É apenas uma DICA de roteamento (a proteção real
 * continua sendo o RoleGuard no client), por isso pode ser legível por JS.
 */
function setAuthHint(present: boolean): void {
  if (typeof document === 'undefined') return;
  // secure só em https: em http://localhost o browser rejeitaria um cookie
  // Secure, e aí o middleware nunca o veria (protegido -> /login pra sempre).
  const secure = location.protocol === 'https:' ? '; secure' : '';
  document.cookie = present
    ? `${AUTH_HINT_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${secure}`
    : `${AUTH_HINT_COOKIE}=; path=/; max-age=0; samesite=lax${secure}`;
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
        if (cancelled) return;
        setUser(me);
        setAuthHint(true);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        // Limpa a dica se sobrou de uma sessão que já morreu no servidor.
        setAuthHint(false);
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
      setAccessToken(null);
      setUser(null);
      setAuthHint(false);
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
    // Seta a dica ANTES de a página chamar router.replace, senão o middleware
    // no destino ainda veria "não logado" e devolveria pro /login.
    setAuthHint(true);
    return me;
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; role: Role }) => {
      await authApi.register(data);
      const me = await authApi.me();
      setUser(me);
      setAuthHint(true);
      return me;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAuthHint(false);
      queryClient.clear();
      router.replace('/login');
    }
  }, [queryClient, router]);

  const deleteAccount = useCallback(async () => {
    // Deixa um erro da API (rede/500) propagar pra UI tratar, sem derrubar a
    // sessão. Só faz o teardown se a exclusão realmente aconteceu.
    await accountApi.remove();

    setUser(null);
    // Precisa limpar a dica: conta excluída + cookie sobrando reintroduziria
    // o loop de redirect (middleware acharia que ainda está logado).
    setAuthHint(false);
    queryClient.clear();
    router.replace('/login?conta=excluida');
  }, [queryClient, router]);

  const refresh = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      setAuthHint(true);
    } catch {
      setUser(null);
      setAuthHint(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, deleteAccount, refresh }),
    [user, initializing, login, register, logout, deleteAccount, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}