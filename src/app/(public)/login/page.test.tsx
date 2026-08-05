import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { ApiError } from '@/lib/http';
import LoginPage from './page';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  resendVerification: vi.fn(),
  replace: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mocks.login }),
  homeFor: () => '/hoje',
}));

vi.mock('@/lib/api/auth', () => ({
  authApi: { resendVerification: mocks.resendVerification },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    error: mocks.toastError,
    success: mocks.toastSuccess,
    toast: vi.fn(),
  }),
}));

vi.mock('@/components/auth/AuthShell', () => ({
  AuthShell: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

beforeEach(() => {
  mocks.resendVerification.mockResolvedValue({ message: 'ok' });
});

async function submitLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), 'lucas@teste.com');
  await user.type(screen.getByLabelText('Senha'), 'Senha123');
  await user.click(screen.getByRole('button', { name: 'Entrar' }));
}

describe('LoginPage — e-mail não confirmado', () => {
  it('mostra o aviso e o botão de reenviar quando o backend responde email_not_verified', async () => {
    mocks.login.mockRejectedValueOnce(
      new ApiError(403, 'Confirme seu e-mail.', undefined, 'email_not_verified'),
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    await submitLogin(user);

    expect(
      await screen.findByText('Confirme seu e-mail para entrar.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reenviar e-mail de confirmação' }),
    ).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('reenvia a confirmação para o e-mail informado', async () => {
    mocks.login.mockRejectedValueOnce(
      new ApiError(403, 'Confirme seu e-mail.', undefined, 'email_not_verified'),
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    await submitLogin(user);
    await user.click(
      await screen.findByRole('button', { name: 'Reenviar e-mail de confirmação' }),
    );

    expect(mocks.resendVerification).toHaveBeenCalledWith('lucas@teste.com');
  });

  it('não mostra o aviso quando a senha está incorreta (401)', async () => {
    mocks.login.mockRejectedValueOnce(new ApiError(401, 'Credenciais inválidas.'));
    const user = userEvent.setup();
    render(<LoginPage />);

    await submitLogin(user);

    expect(mocks.toastError).toHaveBeenCalledWith('Email ou senha incorretos.');
    expect(
      screen.queryByText('Confirme seu e-mail para entrar.'),
    ).not.toBeInTheDocument();
  });
});