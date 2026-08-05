import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ApiError } from '@/lib/http';
import VerificarEmailPage from './page';

const mocks = vi.hoisted(() => ({
  verifyEmail: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '5', hash: 'abc123' }),
  useSearchParams: () => ({ toString: () => 'expires=999&signature=deadbeef' }),
}));

vi.mock('@/lib/api/auth', () => ({
  authApi: { verifyEmail: mocks.verifyEmail },
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
  mocks.verifyEmail.mockReset();
});

describe('VerificarEmailPage', () => {
  it('chama a API com id, hash e a query assinada, e mostra sucesso', async () => {
    mocks.verifyEmail.mockResolvedValueOnce({ message: 'E-mail confirmado com sucesso.' });

    render(<VerificarEmailPage />);

    expect(await screen.findByText('E-mail confirmado')).toBeInTheDocument();
    expect(mocks.verifyEmail).toHaveBeenCalledWith(
      '5',
      'abc123',
      'expires=999&signature=deadbeef',
    );
  });

  it('mostra o estado de erro quando o link é inválido ou expirou', async () => {
    mocks.verifyEmail.mockRejectedValueOnce(new ApiError(403, 'Link inválido.'));

    render(<VerificarEmailPage />);

    expect(await screen.findByText('Não foi possível confirmar')).toBeInTheDocument();
    expect(
      screen.getByText('Este link de confirmação é inválido ou expirou.'),
    ).toBeInTheDocument();
  });
});