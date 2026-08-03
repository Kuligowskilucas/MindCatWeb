import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { Credential, CredentialStatus } from '@/lib/api/credentials';
import { ProVerificationGate } from './ProVerificationGate';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  pathname: '/pro/pacientes',
  credState: { data: undefined, isLoading: false, isError: false } as {
    data: Credential | undefined;
    isLoading: boolean;
    isError: boolean;
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => mocks.pathname,
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/hooks/useCredential', () => ({
  useCredential: () => mocks.credState,
}));

const DAY = 86_400_000;
const iso = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * DAY).toISOString();

function cred(overrides: Partial<Credential> = {}): Credential {
  return {
    id: 1,
    status: 'approved' as CredentialStatus,
    crp_number: '06/12345',
    crp_region: 'PR',
    epsi_registered: true,
    rejection_reason: null,
    submitted_at: iso(-30),
    verified_at: iso(-30),
    next_review_at: null,
    ...overrides,
  };
}

function setState(partial: Partial<typeof mocks.credState>) {
  mocks.credState = { ...mocks.credState, ...partial };
}

beforeEach(() => {
  mocks.pathname = '/pro/pacientes';
  mocks.credState = { data: undefined, isLoading: false, isError: false };
});

const Child = () => <div>CONTEUDO-PRO</div>;

describe('ProVerificationGate', () => {
  it('libera o conteúdo quando a credencial está ativa', async () => {
    setState({ data: cred({ next_review_at: null }) });
    render(
      <ProVerificationGate>
        <Child />
      </ProVerificationGate>,
    );

    expect(await screen.findByText('CONTEUDO-PRO')).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(
      screen.queryByText('A revisão da sua credencial venceu.'),
    ).not.toBeInTheDocument();
  });

  it('redireciona para /pro/verificacao quando inativa numa rota protegida', async () => {
    setState({ data: cred({ status: 'pending' }) });
    render(
      <ProVerificationGate>
        <Child />
      </ProVerificationGate>,
    );

    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith('/pro/verificacao'),
    );
    expect(screen.queryByText('CONTEUDO-PRO')).not.toBeInTheDocument();
  });

  it('deixa passar mesmo inativa nas rotas permitidas (verificação/perfil)', async () => {
    mocks.pathname = '/pro/verificacao';
    setState({ data: cred({ status: 'pending' }) });
    render(
      <ProVerificationGate>
        <Child />
      </ProVerificationGate>,
    );

    expect(await screen.findByText('CONTEUDO-PRO')).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('mostra o banner de carência quando a revisão venceu mas ainda está ativa', async () => {
    setState({ data: cred({ next_review_at: iso(-2) }) });
    render(
      <ProVerificationGate>
        <Child />
      </ProVerificationGate>,
    );

    expect(await screen.findByText('CONTEUDO-PRO')).toBeInTheDocument();
    expect(
      screen.getByText('A revisão da sua credencial venceu.'),
    ).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('mostra o spinner enquanto carrega, sem redirecionar', async () => {
    setState({ data: undefined, isLoading: true });
    render(
      <ProVerificationGate>
        <Child />
      </ProVerificationGate>,
    );

    expect(screen.queryByText('CONTEUDO-PRO')).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});