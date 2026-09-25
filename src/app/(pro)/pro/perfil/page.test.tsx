import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/lib/http';
import { DangerZone } from '@/components/account/DangerZone';
import ProPerfilPage from './page';

const mocks = vi.hoisted(() => ({
  deleteAccount: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/components/account/AccountInfoForm', () => ({
  AccountInfoForm: () => <div>CARD-DADOS</div>,
}));

vi.mock('@/components/account/PasswordChangeForm', () => ({
  PasswordChangeForm: () => <div>CARD-SENHA</div>,
}));

vi.mock('@/components/account/TwoFactorCard', () => ({
  TwoFactorCard: () => <div>CARD-2FA</div>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ deleteAccount: mocks.deleteAccount }),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ success: mocks.toastSuccess, error: mocks.toastError, toast: vi.fn() }),
}));

beforeEach(() => {
  mocks.deleteAccount.mockResolvedValue(undefined);
});

describe('ProPerfilPage — excluir conta', () => {
  it('mostra o card de exclusão com o texto do profissional, não o do paciente', () => {
    render(<ProPerfilPage />);

    expect(screen.getByText('CARD-DADOS')).toBeInTheDocument();
    expect(screen.getByText('CARD-SENHA')).toBeInTheDocument();
    expect(screen.getByText('CARD-2FA')).toBeInTheDocument();

    expect(screen.getByText('Excluir conta')).toBeInTheDocument();
    expect(screen.getByText(/Seus vínculos com pacientes são encerrados/)).toBeInTheDocument();
    expect(screen.getByText(/credencial e os documentos enviados para verificação são apagados/)).toBeInTheDocument();
    expect(screen.getByText(/tarefas que você passou continuam com seus pacientes/)).toBeInTheDocument();
    expect(screen.queryByText(/Seu diário, seus registros de humor/)).not.toBeInTheDocument();
  });

  it('só libera a exclusão depois de digitar EXCLUIR e então exclui a conta', async () => {
    const user = userEvent.setup();
    render(<ProPerfilPage />);

    await user.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    const dialog = screen.getByRole('dialog', { name: 'Excluir sua conta?' });
    expect(within(dialog).queryByRole('button', { name: 'Excluir permanentemente' })).not.toBeInTheDocument();

    const field = within(dialog).getByLabelText('Digite "EXCLUIR" para confirmar');
    await user.click(field);
    await user.keyboard('EXCLUIR');
    expect(field).toHaveValue('EXCLUIR');
    expect(field).toHaveFocus();

    await user.click(within(dialog).getByRole('button', { name: 'Excluir permanentemente' }));

    expect(mocks.deleteAccount).toHaveBeenCalledTimes(1);
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Sua conta foi excluída.');
  });

  it('mostra o erro e mantém a conta quando a API falha', async () => {
    mocks.deleteAccount.mockRejectedValueOnce(new ApiError(500, 'erro'));
    const user = userEvent.setup();
    render(<ProPerfilPage />);

    await user.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Digite "EXCLUIR" para confirmar'), 'EXCLUIR');
    await user.click(within(dialog).getByRole('button', { name: 'Excluir permanentemente' }));

    expect(mocks.toastError).toHaveBeenCalledTimes(1);
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('DangerZone — texto padrão', () => {
  it('sem descrição, mantém o texto do paciente', () => {
    render(<DangerZone />);

    expect(screen.getByText(/Seu diário, seus registros de humor e suas tarefas são apagados/)).toBeInTheDocument();
  });
});
