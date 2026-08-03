import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiaryGate } from './DiaryGate';

const mocks = vi.hoisted(() => ({
  unlockMutate: vi.fn(),
  setPasswordMutate: vi.fn(),
  toastSuccess: vi.fn(),
  diaryErrorMessage: vi.fn(),
}));

vi.mock('@/hooks/useDiary', () => ({
  useUnlockDiary: () => ({ mutateAsync: mocks.unlockMutate, isPending: false }),
  useSetDiaryPassword: () => ({
    mutateAsync: mocks.setPasswordMutate,
    isPending: false,
  }),
  diaryErrorMessage: mocks.diaryErrorMessage,
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    success: mocks.toastSuccess,
    error: vi.fn(),
    toast: vi.fn(),
  }),
}));

beforeEach(() => {
  mocks.unlockMutate.mockResolvedValue(undefined);
  mocks.setPasswordMutate.mockResolvedValue(undefined);
  mocks.diaryErrorMessage.mockReturnValue('Senha do diário incorreta.');
});

describe('DiaryGate — destravar (senha já existe)', () => {
  it('exige a senha antes de chamar a API', async () => {
    const user = userEvent.setup();
    const onUnlocked = vi.fn();
    render(<DiaryGate hasPassword onUnlocked={onUnlocked} />);

    await user.click(screen.getByRole('button', { name: 'Destravar' }));

    expect(screen.getByText('Digite a senha do diário.')).toBeInTheDocument();
    expect(mocks.unlockMutate).not.toHaveBeenCalled();
    expect(onUnlocked).not.toHaveBeenCalled();
  });

  it('destrava e devolve a senha em claro no sucesso', async () => {
    const user = userEvent.setup();
    const onUnlocked = vi.fn();
    render(<DiaryGate hasPassword onUnlocked={onUnlocked} />);

    await user.type(screen.getByLabelText('Senha do diário'), 'MinhaSenha1');
    await user.click(screen.getByRole('button', { name: 'Destravar' }));

    expect(mocks.unlockMutate).toHaveBeenCalledWith('MinhaSenha1');
    expect(onUnlocked).toHaveBeenCalledWith('MinhaSenha1');
  });

  it('mostra o erro traduzido quando a API recusa a senha', async () => {
    mocks.unlockMutate.mockRejectedValueOnce(new Error('401'));
    const user = userEvent.setup();
    const onUnlocked = vi.fn();
    render(<DiaryGate hasPassword onUnlocked={onUnlocked} />);

    await user.type(screen.getByLabelText('Senha do diário'), 'Errada123');
    await user.click(screen.getByRole('button', { name: 'Destravar' }));

    expect(
      await screen.findByText('Senha do diário incorreta.'),
    ).toBeInTheDocument();
    expect(onUnlocked).not.toHaveBeenCalled();
  });
});

describe('DiaryGate — criar senha (primeiro acesso)', () => {
  it('barra senha fraca com a regra local, sem chamar a API', async () => {
    const user = userEvent.setup();
    const onUnlocked = vi.fn();
    render(<DiaryGate hasPassword={false} onUnlocked={onUnlocked} />);

    await user.type(screen.getByLabelText('Nova senha do diário'), 'fraca');
    await user.click(screen.getByRole('button', { name: 'Criar senha' }));

    expect(
      screen.getByText('A senha deve ter pelo menos 8 caracteres.'),
    ).toBeInTheDocument();
    expect(mocks.setPasswordMutate).not.toHaveBeenCalled();
  });

  it('exige que as duas senhas confiram', async () => {
    const user = userEvent.setup();
    const onUnlocked = vi.fn();
    render(<DiaryGate hasPassword={false} onUnlocked={onUnlocked} />);

    await user.type(screen.getByLabelText('Nova senha do diário'), 'SenhaForte1');
    await user.type(screen.getByLabelText('Confirme a senha'), 'Diferente1');
    await user.click(screen.getByRole('button', { name: 'Criar senha' }));

    expect(screen.getByText('As senhas não conferem.')).toBeInTheDocument();
    expect(mocks.setPasswordMutate).not.toHaveBeenCalled();
  });

  it('cria a senha e entra direto no diário quando tudo confere', async () => {
    const user = userEvent.setup();
    const onUnlocked = vi.fn();
    render(<DiaryGate hasPassword={false} onUnlocked={onUnlocked} />);

    await user.type(screen.getByLabelText('Nova senha do diário'), 'SenhaForte1');
    await user.type(screen.getByLabelText('Confirme a senha'), 'SenhaForte1');
    await user.click(screen.getByRole('button', { name: 'Criar senha' }));

    expect(mocks.setPasswordMutate).toHaveBeenCalledWith({
      new_password: 'SenhaForte1',
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Senha do diário criada.');
    expect(onUnlocked).toHaveBeenCalledWith('SenhaForte1');
  });
});