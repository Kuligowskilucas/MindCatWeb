import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { User } from '@/lib/types';
import { AUTH_EXPIRED_EVENT } from '@/lib/http';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';


const mocks = vi.hoisted(() => ({
  me: vi.fn(),
  replace: vi.fn(),
  login: vi.fn(),
  verifyOtp: vi.fn(),
  resendOtp: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock('@/lib/api/auth', () => ({
  authApi: {
    me: mocks.me,
    login: mocks.login,
    verifyOtp: mocks.verifyOtp,
    resendOtp: mocks.resendOtp,
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

function ActionsProbe() {
  const { login, verifyTwoFactor } = useAuth();
  const [out, setOut] = useState('');
  return (
    <div>
      <button
        onClick={async () => {
          const r = await login('a@b.com', 'x');
          setOut('twoFactorRequired' in r ? `2fa:${r.challenge}` : `user:${r.user.email}`);
        }}
      >
        go
      </button>
      <button
        onClick={async () => {
          const u = await verifyTwoFactor('chal', '123456');
          setOut(`verified:${u.email}`);
        }}
      >
        verify
      </button>
      <span data-testid="out">{out}</span>
    </div>
  );
}

function renderActions() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <ActionsProbe />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('AuthProvider — 2FA', () => {
  beforeEach(() => {
    mocks.me.mockReset();
    mocks.login.mockReset();
    mocks.verifyOtp.mockReset();
    mocks.replace.mockReset();
  });

  it('login sem 2FA retorna o usuário', async () => {
    mocks.me.mockRejectedValueOnce(new Error('no session')).mockResolvedValueOnce(user);
    mocks.login.mockResolvedValueOnce({ message: 'ok', user, token: 't', expires_in: 60 });

    renderActions();
    await screen.findByText('go');
    await act(async () => {
      screen.getByText('go').click();
    });

    await waitFor(() =>
      expect(screen.getByTestId('out')).toHaveTextContent('user:lucas@mindcat.com.br'),
    );
  });

  it('login com 2FA retorna o challenge e não busca o /me pós-login', async () => {
    mocks.me.mockRejectedValueOnce(new Error('no session'));
    mocks.login.mockResolvedValueOnce({ two_factor_required: true, challenge: 'abc', message: 'ok' });

    renderActions();
    await screen.findByText('go');
    await act(async () => {
      screen.getByText('go').click();
    });

    await waitFor(() => expect(screen.getByTestId('out')).toHaveTextContent('2fa:abc'));
    expect(mocks.me).toHaveBeenCalledTimes(1);
  });

  it('verifyTwoFactor completa o login', async () => {
    mocks.me.mockRejectedValueOnce(new Error('no session')).mockResolvedValueOnce(user);
    mocks.verifyOtp.mockResolvedValueOnce({ message: 'ok', user, token: 't', expires_in: 60 });

    renderActions();
    await screen.findByText('verify');
    await act(async () => {
      screen.getByText('verify').click();
    });

    await waitFor(() =>
      expect(screen.getByTestId('out')).toHaveTextContent('verified:lucas@mindcat.com.br'),
    );
  });
});