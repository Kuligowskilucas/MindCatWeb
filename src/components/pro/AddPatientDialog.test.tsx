import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/lib/http';
import { AddPatientDialog } from './AddPatientDialog';

const mocks = vi.hoisted(() => ({
  redeemMutate: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@/hooks/useInvites', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useInvites')>();
  return {
    ...actual,
    useRedeemInvite: () => ({
      mutateAsync: mocks.redeemMutate,
      isPending: false,
    }),
  };
});

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    success: mocks.toastSuccess,
    error: vi.fn(),
    toast: vi.fn(),
  }),
}));

beforeEach(() => {
  mocks.redeemMutate.mockResolvedValue(undefined);
});

describe('AddPatientDialog', () => {
  it('exige um código antes de chamar a API', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddPatientDialog open onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Vincular' }));

    expect(screen.getByText('Informe o código do convite.')).toBeInTheDocument();
    expect(mocks.redeemMutate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('resgata o código (em maiúsculas), avisa e fecha no sucesso', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddPatientDialog open onClose={onClose} />);

    await user.type(screen.getByLabelText('Código do convite'), 'abcd2345');
    await user.click(screen.getByRole('button', { name: 'Vincular' }));

    expect(mocks.redeemMutate).toHaveBeenCalledWith('ABCD2345');
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Paciente vinculado.');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('mostra a mensagem traduzida e mantém o diálogo aberto no 422', async () => {
    mocks.redeemMutate.mockRejectedValueOnce(new ApiError(422, 'invalid'));
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AddPatientDialog open onClose={onClose} />);

    await user.type(screen.getByLabelText('Código do convite'), 'ZZZZ9999');
    await user.click(screen.getByRole('button', { name: 'Vincular' }));

    expect(
      await screen.findByText(
        'Código inválido ou expirado. Peça um novo ao paciente.',
      ),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});