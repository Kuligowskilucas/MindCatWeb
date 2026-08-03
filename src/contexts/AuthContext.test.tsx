import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { User } from '@/lib/types';
import { AUTH_EXPIRED_EVENT } from '@/lib/http';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const mocks = vi.hoisted(() => ({ me: vi.fn(), replace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock('@/lib/api/auth', () => ({
  authApi: {
    me: mocks.me,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

vi.mock('@/lib/api/account', () => ({
  accountApi: { remove: vi.fn() },
}));

const user: User = {
  id: 1,
  name: 'Lucas',
  email: 'lucas@mindcat.com.br',
  role: 'patient',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function Probe() {
  const { user, initializing } = useAuth();
  if (initializing) return <span>carregando</span>;
  return <span>{user ? user.email : 'no-user'}</span>;
}

function renderProvider() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  document.cookie = 'mindcat_auth=; path=/; max-age=0';
});

describe('AuthProvider', () => {
  it('carrega a sessão pelo /me e planta o cookie-dica', async () => {
    mocks.me.mockResolvedValueOnce(user);
    renderProvider();

    expect(await screen.findByText('lucas@mindcat.com.br')).toBeInTheDocument();
    expect(document.cookie).toContain('mindcat_auth=1');
  });

  it('fica sem usuário quando o /me falha', async () => {
    mocks.me.mockRejectedValueOnce(new Error('sem sessão'));
    renderProvider();

    expect(await screen.findByText('no-user')).toBeInTheDocument();
    expect(document.cookie).not.toContain('mindcat_auth=1');
  });

  it('no evento de sessão expirada, redireciona e limpa o usuário', async () => {
    mocks.me.mockResolvedValueOnce(user);
    renderProvider();
    await screen.findByText('lucas@mindcat.com.br');

    act(() => {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    });

    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith('/login?expirou=1'),
    );
    expect(await screen.findByText('no-user')).toBeInTheDocument();
  });
});