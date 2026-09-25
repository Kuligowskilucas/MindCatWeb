import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Credential, CredentialStatus } from '@/lib/api/credentials';
import ProLayout from './layout';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  pathname: '/pro',
  credState: { data: undefined, isLoading: false, isError: false } as {
    data: Credential | undefined;
    isLoading: boolean;
    isError: boolean;
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  usePathname: () => mocks.pathname,
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/layout/RoleGuard', () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useCredential', () => ({
  useCredential: () => mocks.credState,
}));

const DAY = 86_400_000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();

function cred(overrides: Partial<Credential> = {}): Credential {
  return {
    id: 1,
    status: 'approved' as CredentialStatus,
    profession: 'psychologist',
    council: 'CRP',
    registration_number: '06/12345',
    registration_region: '06',
    rqe_number: null,
    epsi_registered: true,
    rejection_reason: null,
    submitted_at: iso(-30),
    verified_at: iso(-30),
    next_review_at: null,
    ...overrides,
  };
}

const STATUSES: CredentialStatus[] = [
  'pending',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'suspended',
  'expired',
];

beforeEach(() => {
  mocks.pathname = '/pro';
  mocks.credState = { data: undefined, isLoading: false, isError: false };
});

describe('ProLayout sem bloqueio de credencial', () => {
  it.each(STATUSES)('libera o painel com credencial %s, sem redirecionar', (status) => {
    mocks.credState = { data: cred({ status }), isLoading: false, isError: false };

    render(
      <ProLayout>
        <div>CONTEUDO-PRO</div>
      </ProLayout>,
    );

    expect(screen.getByText('CONTEUDO-PRO')).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('libera o painel com a revisão vencida além da carência', () => {
    mocks.credState = {
      data: cred({ next_review_at: iso(-30) }),
      isLoading: false,
      isError: false,
    };

    render(
      <ProLayout>
        <div>CONTEUDO-PRO</div>
      </ProLayout>,
    );

    expect(screen.getByText('CONTEUDO-PRO')).toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it('não segura o conteúdo enquanto a credencial carrega', () => {
    mocks.credState = { data: undefined, isLoading: true, isError: false };

    render(
      <ProLayout>
        <div>CONTEUDO-PRO</div>
      </ProLayout>,
    );

    expect(screen.getByText('CONTEUDO-PRO')).toBeInTheDocument();
  });
});

describe('ProLayout — aviso de verificação', () => {
  function renderLayout() {
    render(
      <ProLayout>
        <div>CONTEUDO-PRO</div>
      </ProLayout>,
    );
  }

  it.each(['pending', 'rejected', 'expired', 'suspended'] as CredentialStatus[])(
    'mostra aviso discreto com link para a verificação quando a credencial está %s',
    (status) => {
      mocks.credState = { data: cred({ status }), isLoading: false, isError: false };
      renderLayout();

      expect(screen.getByText(/ainda não foi verificado/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Verificar registro' })).toHaveAttribute(
        'href',
        '/pro/verificacao',
      );
      expect(screen.getByText('CONTEUDO-PRO')).toBeInTheDocument();
    },
  );

  it('fala em análise quando a credencial foi enviada', () => {
    mocks.credState = { data: cred({ status: 'submitted' }), isLoading: false, isError: false };
    renderLayout();

    expect(screen.getByText(/está em análise/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver verificação' })).toHaveAttribute(
      'href',
      '/pro/verificacao',
    );
  });

  it('trata aprovada com carência vencida como não verificada', () => {
    mocks.credState = {
      data: cred({ next_review_at: iso(-30) }),
      isLoading: false,
      isError: false,
    };
    renderLayout();

    expect(screen.getByText(/ainda não foi verificado/)).toBeInTheDocument();
  });

  it('não mostra aviso quando a credencial está aprovada e em dia', () => {
    mocks.credState = { data: cred(), isLoading: false, isError: false };
    renderLayout();

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('mostra o banner de carência, sem falar em bloqueio, quando a revisão venceu há pouco', () => {
    mocks.credState = {
      data: cred({ next_review_at: iso(-2) }),
      isLoading: false,
      isError: false,
    };
    renderLayout();

    expect(screen.getByText('A revisão da sua credencial venceu.')).toBeInTheDocument();
    expect(screen.getByText(/Seu atendimento continua normalmente/)).toBeInTheDocument();
    expect(screen.queryByText(/bloquead/)).not.toBeInTheDocument();
  });

  it('não repete o aviso na própria página de verificação', () => {
    mocks.pathname = '/pro/verificacao';
    mocks.credState = { data: cred({ status: 'pending' }), isLoading: false, isError: false };
    renderLayout();

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('CONTEUDO-PRO')).toBeInTheDocument();
  });
});
