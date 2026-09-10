import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Feeling } from '@/lib/types';
import { FeelingPicker } from './FeelingPicker';

function feelings(count: number): Feeling[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    slug: `sentimento-${i + 1}`,
    label: `Sentimento ${i + 1}`,
  }));
}

describe('FeelingPicker', () => {
  it('seleciona um sentimento ao clicar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FeelingPicker feelings={feelings(3)} selected={[]} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Sentimento 1' }));

    expect(onChange).toHaveBeenCalledWith(['sentimento-1']);
  });

  it('desmarca um sentimento já selecionado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FeelingPicker
        feelings={feelings(3)}
        selected={['sentimento-1', 'sentimento-2']}
        onChange={onChange}
      />,
    );

    const btn = screen.getByRole('button', { name: 'Sentimento 1' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');

    await user.click(btn);

    expect(onChange).toHaveBeenCalledWith(['sentimento-2']);
  });

  it('desabilita os não marcados ao atingir o limite de 5 e explica o motivo', () => {
    const onChange = vi.fn();
    const selected = ['sentimento-1', 'sentimento-2', 'sentimento-3', 'sentimento-4', 'sentimento-5'];
    render(<FeelingPicker feelings={feelings(6)} selected={selected} onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Sentimento 6' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sentimento 1' })).toBeEnabled();
    expect(
      screen.getByText('Você já marcou o máximo de 5 sentimentos. Desmarque um para trocar.'),
    ).toBeInTheDocument();
  });

  it('não chama onChange ao clicar num chip desabilitado pelo limite', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const selected = ['sentimento-1', 'sentimento-2', 'sentimento-3', 'sentimento-4', 'sentimento-5'];
    render(<FeelingPicker feelings={feelings(6)} selected={selected} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Sentimento 6' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
