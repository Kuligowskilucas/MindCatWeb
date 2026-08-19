import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import RegistroPage from './page';

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  resendVerification: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ register: mocks.register }),
}));

vi.mock('@/lib/api/auth', () => ({
  authApi: { resendVerification: mocks.resendVerification },
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

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome completo'), 'Lucas Silva');
  await user.type(screen.getByLabelText('Email'), 'lucas@teste.com');
  await user.type(screen.getByLabelText('Senha'), 'Senha123');
  await user.type(screen.getByLabelText('Confirmar senha'), 'Senha123');
  await user.click(screen.getByRole('checkbox'));
}

beforeEach(() => {
  mocks.register.mockResolvedValue({
    id: 1,
    name: 'Lucas Silva',
    email: 'lucas@teste.com',
    role: 'patient',
  });
  mocks.resendVerification.mockResolvedValue({ message: 'ok' });
});

describe('RegistroPage', () => {
  it('mostra o estado "confira seu e-mail" após cadastrar, sem redirecionar', async () => {
    const user = userEvent.setup();
    render(<RegistroPage />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Confira seu e-mail')).toBeInTheDocument();
    expect(screen.getByText('lucas@teste.com')).toBeInTheDocument();
    expect(mocks.register).toHaveBeenCalledTimes(1);
  });

  it('exige aceitar os termos antes de cadastrar', async () => {
    const user = userEvent.setup();
    render(<RegistroPage />);

    await user.type(screen.getByLabelText('Nome completo'), 'Lucas Silva');
    await user.type(screen.getByLabelText('Email'), 'lucas@teste.com');
    await user.type(screen.getByLabelText('Senha'), 'Senha123');
    await user.type(screen.getByLabelText('Confirmar senha'), 'Senha123');

    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByText(
        'É necessário aceitar os Termos de Uso e a Política de Privacidade.',
      ),
    ).toBeInTheDocument();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it('reenvia o e-mail de confirmação a partir do estado de sucesso', async () => {
    const user = userEvent.setup();
    render(<RegistroPage />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));

    await user.click(await screen.findByRole('button', { name: 'Reenviar e-mail' }));

    expect(mocks.resendVerification).toHaveBeenCalledWith('lucas@teste.com');
  });
});