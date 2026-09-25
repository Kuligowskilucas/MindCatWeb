import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Credential, CredentialStatus } from '@/lib/api/credentials';
import VerificacaoPage from './page';

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  credential: undefined as Credential | undefined,
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/hooks/useCredential', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useCredential')>();
  return {
    ...actual,
    useCredential: () => ({ data: mocks.credential, isLoading: false }),
    useSubmitCredential: () => ({ mutateAsync: mocks.submit, isPending: false }),
  };
});

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ success: mocks.toastSuccess, error: mocks.toastError, toast: vi.fn() }),
}));

function cred(overrides: Partial<Credential> = {}): Credential {
  return {
    id: 1,
    status: 'pending' as CredentialStatus,
    profession: null,
    council: null,
    registration_number: null,
    registration_region: null,
    rqe_number: null,
    epsi_registered: false,
    rejection_reason: null,
    submitted_at: null,
    verified_at: null,
    next_review_at: null,
    ...overrides,
  };
}

const pdf = (name: string) => new File(['%PDF'], name, { type: 'application/pdf' });

function sentForm(): FormData {
  expect(mocks.submit).toHaveBeenCalledTimes(1);
  return mocks.submit.mock.calls[0][0] as FormData;
}

function optionValues(select: HTMLElement): string[] {
  return within(select)
    .getAllByRole('option')
    .map((o) => (o as HTMLOptionElement).value)
    .filter(Boolean);
}

beforeEach(() => {
  mocks.credential = cred();
  mocks.submit.mockResolvedValue(cred({ status: 'submitted' }));
});

describe('VerificacaoPage — textos sem bloqueio', () => {
  it('apresenta a verificação como opcional, para ganhar o selo', () => {
    render(<VerificacaoPage />);

    expect(screen.getByText(/A verificação é opcional, para ganhar o selo de verificado que seus pacientes veem/)).toBeInTheDocument();
    expect(screen.queryByText(/obrigatório para atender|Para atender pacientes/)).not.toBeInTheDocument();
  });

  it('no estado expirado fala do selo, não em voltar a atender', () => {
    mocks.credential = cred({ status: 'expired' });
    render(<VerificacaoPage />);

    expect(screen.getByText('Sua credencial venceu.')).toBeInTheDocument();
    expect(screen.getByText(/deixaram de ver o selo de verificado/)).toBeInTheDocument();
    expect(screen.queryByText(/voltar a atender/)).not.toBeInTheDocument();
  });

  it('com revisão vencida explica que o atendimento continua', () => {
    mocks.credential = cred({
      status: 'approved',
      profession: 'psychologist',
      next_review_at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    });
    render(<VerificacaoPage />);

    expect(screen.getByText('Revisão vencida')).toBeInTheDocument();
    expect(screen.getByText(/Seu atendimento continua normalmente/)).toBeInTheDocument();
    expect(screen.queryByText(/voltar a atender|bloquead/)).not.toBeInTheDocument();
  });
});

describe('VerificacaoPage — formulário por profissão', () => {
  it('começa só com o seletor de profissão e exige a escolha', async () => {
    const user = userEvent.setup();
    render(<VerificacaoPage />);

    expect(screen.getByRole('radio', { name: 'Psicólogo(a)' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Psiquiatra' })).not.toBeChecked();
    expect(screen.queryByLabelText(/Número do/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Enviar para análise' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Escolha sua profissão.');
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('psicólogo vê CRP, região 01–24, e-Psi e os dois comprovantes', async () => {
    const user = userEvent.setup();
    render(<VerificacaoPage />);

    await user.click(screen.getByRole('radio', { name: 'Psicólogo(a)' }));

    expect(screen.getByLabelText('Número do CRP')).toBeInTheDocument();
    const region = screen.getByLabelText('Região do CRP');
    const values = optionValues(region);
    expect(values).toHaveLength(24);
    expect(values[0]).toBe('01');
    expect(values[23]).toBe('24');
    expect(screen.getByRole('checkbox', { name: /registro ativo no e-Psi/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Comprovante do CRP')).toBeInTheDocument();
    expect(screen.getByLabelText('Comprovante do e-Psi')).toBeInTheDocument();

    expect(screen.queryByLabelText(/Número do CRM/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('UF do CRM')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/RQE/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Comprovante do CRM')).not.toBeInTheDocument();
  });

  it('psicólogo envia exatamente os campos do StoreCredentialRequest', async () => {
    const user = userEvent.setup();
    render(<VerificacaoPage />);

    await user.click(screen.getByRole('radio', { name: 'Psicólogo(a)' }));
    await user.type(screen.getByLabelText('Número do CRP'), ' 06/123456 ');
    await user.selectOptions(screen.getByLabelText('Região do CRP'), '06');
    await user.click(screen.getByRole('checkbox', { name: /registro ativo no e-Psi/ }));
    await user.upload(screen.getByLabelText('Comprovante do CRP'), pdf('crp.pdf'));
    await user.upload(screen.getByLabelText('Comprovante do e-Psi'), pdf('epsi.pdf'));
    await user.click(screen.getByRole('button', { name: 'Enviar para análise' }));

    const form = sentForm();
    expect([...form.keys()].sort()).toEqual([
      'epsi_document',
      'epsi_registered',
      'profession',
      'registration_document',
      'registration_number',
      'registration_region',
    ]);
    expect(form.get('profession')).toBe('psychologist');
    expect(form.get('registration_number')).toBe('06/123456');
    expect(form.get('registration_region')).toBe('06');
    expect(form.get('epsi_registered')).toBe('1');
    expect((form.get('registration_document') as File).name).toBe('crp.pdf');
    expect((form.get('epsi_document') as File).name).toBe('epsi.pdf');
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Documentos enviados para análise.');
  });

  it('psicólogo precisa confirmar o e-Psi e anexar o comprovante dele', async () => {
    const user = userEvent.setup();
    render(<VerificacaoPage />);

    await user.click(screen.getByRole('radio', { name: 'Psicólogo(a)' }));
    await user.type(screen.getByLabelText('Número do CRP'), '06/123456');
    await user.selectOptions(screen.getByLabelText('Região do CRP'), '06');
    await user.upload(screen.getByLabelText('Comprovante do CRP'), pdf('crp.pdf'));
    await user.click(screen.getByRole('button', { name: 'Enviar para análise' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Confirme seu registro no e-Psi');

    await user.click(screen.getByRole('checkbox', { name: /registro ativo no e-Psi/ }));
    await user.click(screen.getByRole('button', { name: 'Enviar para análise' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Anexe o comprovante do e-Psi.');
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('psiquiatra vê CRM, UF com as 27 UFs, RQE opcional e só o comprovante do CRM', async () => {
    const user = userEvent.setup();
    render(<VerificacaoPage />);

    await user.click(screen.getByRole('radio', { name: 'Psiquiatra' }));

    expect(screen.getByLabelText('Número do CRM')).toBeInTheDocument();
    const uf = screen.getByLabelText('UF do CRM');
    const values = optionValues(uf);
    expect(values).toHaveLength(27);
    expect(values).toEqual(expect.arrayContaining(['SP', 'DF', 'TO', 'AC']));
    expect(values.every((v) => /^[A-Z]{2}$/.test(v))).toBe(true);
    expect(screen.getByLabelText('RQE em Psiquiatria (opcional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Comprovante do CRM')).toBeInTheDocument();

    expect(screen.queryByLabelText('Número do CRP')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Região do CRP')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /e-Psi/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Comprovante do e-Psi')).not.toBeInTheDocument();
  });

  it('psiquiatra sem RQE não envia rqe_number nem campos do e-Psi', async () => {
    const user = userEvent.setup();
    render(<VerificacaoPage />);

    await user.click(screen.getByRole('radio', { name: 'Psiquiatra' }));
    await user.type(screen.getByLabelText('Número do CRM'), '123456');
    await user.selectOptions(screen.getByLabelText('UF do CRM'), 'RJ');
    await user.upload(screen.getByLabelText('Comprovante do CRM'), pdf('crm.pdf'));
    await user.click(screen.getByRole('button', { name: 'Enviar para análise' }));

    const form = sentForm();
    expect([...form.keys()].sort()).toEqual([
      'profession',
      'registration_document',
      'registration_number',
      'registration_region',
    ]);
    expect(form.get('profession')).toBe('psychiatrist');
    expect(form.get('registration_region')).toBe('RJ');
    expect((form.get('registration_document') as File).name).toBe('crm.pdf');
  });

  it('psiquiatra com RQE envia rqe_number', async () => {
    const user = userEvent.setup();
    render(<VerificacaoPage />);

    await user.click(screen.getByRole('radio', { name: 'Psiquiatra' }));
    await user.type(screen.getByLabelText('Número do CRM'), '123456');
    await user.selectOptions(screen.getByLabelText('UF do CRM'), 'SP');
    await user.type(screen.getByLabelText('RQE em Psiquiatria (opcional)'), '98765');
    await user.upload(screen.getByLabelText('Comprovante do CRM'), pdf('crm.pdf'));
    await user.click(screen.getByRole('button', { name: 'Enviar para análise' }));

    expect(sentForm().get('rqe_number')).toBe('98765');
  });

  it('trocar de profissão limpa os dados da anterior', async () => {
    const user = userEvent.setup();
    render(<VerificacaoPage />);

    await user.click(screen.getByRole('radio', { name: 'Psicólogo(a)' }));
    await user.type(screen.getByLabelText('Número do CRP'), '06/123456');
    await user.click(screen.getByRole('radio', { name: 'Psiquiatra' }));

    expect(screen.getByLabelText('Número do CRM')).toHaveValue('');
    expect(screen.getByLabelText('UF do CRM')).toHaveValue('');
  });

  it('no reenvio após recusa, preenche profissão e registro anteriores', () => {
    mocks.credential = cred({
      status: 'rejected',
      rejection_reason: 'Documento ilegível.',
      profession: 'psychiatrist',
      council: 'CRM',
      registration_number: '123456',
      registration_region: 'MG',
      rqe_number: '555',
    });
    render(<VerificacaoPage />);

    expect(screen.getByText('Motivo: Documento ilegível.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Psiquiatra' })).toBeChecked();
    expect(screen.getByLabelText('Número do CRM')).toHaveValue('123456');
    expect(screen.getByLabelText('UF do CRM')).toHaveValue('MG');
    expect(screen.getByLabelText('RQE em Psiquiatria (opcional)')).toHaveValue('555');
    expect(screen.getByRole('button', { name: 'Reenviar' })).toBeInTheDocument();
  });
});
