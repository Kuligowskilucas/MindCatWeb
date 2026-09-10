import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MoodRangeCard } from './MoodRangeCard';

const mocks = vi.hoisted(() => ({ useMoods: vi.fn() }));

vi.mock('@/hooks/useMoods', () => ({
  useMoods: mocks.useMoods,
}));

beforeEach(() => {
  mocks.useMoods.mockReturnValue({ data: [], isLoading: false, isError: false });
});

describe('MoodRangeCard', () => {
  it('busca 7 dias por padrão', () => {
    render(<MoodRangeCard />);

    expect(mocks.useMoods).toHaveBeenCalledWith(7);
    expect(screen.getByText('Os últimos 7 dias')).toBeInTheDocument();
  });

  it('troca a janela para 30 dias e refaz a busca com o novo período', async () => {
    const user = userEvent.setup();
    render(<MoodRangeCard />);

    await user.click(screen.getByRole('button', { name: '30 dias' }));

    expect(mocks.useMoods).toHaveBeenLastCalledWith(30);
    expect(screen.getByText('Os últimos 30 dias')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 dias' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '7 dias' })).toHaveAttribute('aria-pressed', 'false');
  });
});
