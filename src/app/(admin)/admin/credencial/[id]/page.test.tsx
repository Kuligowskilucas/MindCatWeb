import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/lib/http';
import type { AdminCredentialDetail } from '@/lib/api/adminCredentials';
import AdminCredentialDetailPage from './page';

const mocks = vi.hoisted(() => ({
  detail: undefined as AdminCredentialDetail | undefined,
  approve: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '7' }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/hooks/useAdminCredentials', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useAdminCredentials')>();
  return {
    ...actual,
    useAdminCredentialDetail: () => ({ data: mocks.detail, isLoading: false, error: null }),
    useApproveCredential: () => ({ mutateAsync: mocks.approve, isPending: false }),
    useRejectCredential: () => ({ mutateAsync: vi.fn(), isPending: false }),
  };
});

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ success: mocks.toastSuccess, error: mocks.toastError, toast: vi.fn() }),
}));

function detail(credential: Partial<AdminCredentialDetail['credential']> = {}): AdminCredentialDetail {
  return {
    credential: {
      id: 7,
      status: 'submitted',
      profession: 'psychologist',
      council: 'CRP',
      registration_number: '06/123456',
      registration_region: '06',
      rqe_number: null,
      epsi_registered: true,
      rejection_reason: null,
      submitted_at: '2026-09-20T10:00:00.000Z',
      verified_at: null,
      user: { id: 3, name: 'Ana Souza', email: 'ana@example.com' },
      ...credential,
    },
    documents: [],
  };
}

function row(label: string): string | null | undefined {
  return screen.getByText(label).nextElementSibling?.textContent;
}

beforeEach(() => {
  mocks.detail = detail();
  mocks.approve.mockResolvedValue({});
});

describe('AdminCredentialDetailPage — dados de profissão e conselho', () => {
  it('mostra psicólogo com CRP, região e e-Psi, sem RQE', () => {
    render(<AdminCredentialDetailPage />);

    expect(row('Profissão')).toBe('Psicólogo(a)');
    expect(row('Conselho')).toBe('CRP');
    expect(row('Número')).toBe('06/123456');
    expect(row('Região')).toBe('06');
    expect(row('e-Psi declarado')).toBe('Sim');
    expect(screen.queryByText('RQE')).not.toBeInTheDocument();
    expect(screen.queryByText('UF')).not.toBeInTheDocument();
  });

  it('mostra psiquiatra com CRM, UF e RQE, sem e-Psi', () => {
    mocks.detail = detail({
      profession: 'psychiatrist',
      council: 'CRM',
      registration_number: '123456',
      registration_region: 'SP',
      rqe_number: '98765',
      epsi_registered: false,
    });
    render(<AdminCredentialDetailPage />);

    expect(row('Profissão')).toBe('Psiquiatra');
    expect(row('Conselho')).toBe('CRM');
    expect(row('Número')).toBe('123456');
    expect(row('UF')).toBe('SP');
    expect(row('RQE')).toBe('98765');
    expect(screen.queryByText('e-Psi declarado')).not.toBeInTheDocument();
    expect(screen.queryByText('CRP')).not.toBeInTheDocument();
  });

  it('mostra RQE como não informado para psiquiatra sem RQE', () => {
    mocks.detail = detail({ profession: 'psychiatrist', council: 'CRM', rqe_number: null });
    render(<AdminCredentialDetailPage />);

    expect(row('RQE')).toBe('Não informado');
  });

  it('mostra credencial legada sem profissão e avisa que a aprovação será recusada', () => {
    mocks.detail = detail({ profession: null, council: null, registration_number: null });
    render(<AdminCredentialDetailPage />);

    expect(row('Profissão')).toBe('Não informada');
    expect(row('Conselho')).toBe('—');
    expect(row('Número')).toBe('—');
    expect(row('Região/UF')).toBe('06');
    expect(screen.getByText(/não tem profissão ou número de registro/)).toBeInTheDocument();
  });
});

describe('AdminCredentialDetailPage — aprovação', () => {
  it('aprova uma credencial completa', async () => {
    const user = userEvent.setup();
    render(<AdminCredentialDetailPage />);

    expect(screen.queryByText(/não tem profissão ou número de registro/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aprovar' }));

    expect(mocks.approve).toHaveBeenCalledWith(7);
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Credencial aprovada.');
  });

  it('mostra a mensagem da API quando o approve responde 422', async () => {
    const message = 'A credencial precisa de profissão e número de registro para ser aprovada.';
    mocks.detail = detail({ profession: null, council: null });
    mocks.approve.mockRejectedValueOnce(new ApiError(422, message));
    const user = userEvent.setup();
    render(<AdminCredentialDetailPage />);

    await user.click(screen.getByRole('button', { name: 'Aprovar' }));

    expect(mocks.toastError).toHaveBeenCalledWith(message);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });
});
