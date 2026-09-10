import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MoodCheckIn } from './MoodCheckIn';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@/hooks/useMoods', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useMoods')>();
  return {
    ...actual,
    useTodayMood: () => ({ todayMood: null, moods: [], isLoading: false }),
    useCreateMood: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }),
  };
});

vi.mock('@/hooks/useFeelings', () => ({
  useFeelings: () => ({
    data: [
      { id: 1, slug: 'ansioso', label: 'Ansioso' },
      { id: 2, slug: 'calmo', label: 'Calmo' },
    ],
  }),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ success: mocks.toastSuccess, error: vi.fn(), toast: vi.fn() }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  mocks.mutateAsync.mockResolvedValue({ id: 1 });
});

describe('MoodCheckIn', () => {
  it('envia os slugs de sentimentos escolhidos ao registrar o humor', async () => {
    const user = userEvent.setup();
    render(<MoodCheckIn />, { wrapper });

    await user.click(screen.getByRole('radio', { name: 'Feliz' }));
    await user.click(screen.getByRole('button', { name: 'Ansioso' }));
    await user.click(screen.getByRole('button', { name: 'Registrar humor' }));

    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      mood_level: 4,
      mood_description: undefined,
      feelings: ['ansioso'],
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Humor registrado. Cuide-se hoje.');
  });

  it('não envia feelings quando nenhum sentimento é marcado', async () => {
    const user = userEvent.setup();
    render(<MoodCheckIn />, { wrapper });

    await user.click(screen.getByRole('radio', { name: 'Normal' }));
    await user.click(screen.getByRole('button', { name: 'Registrar humor' }));

    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      mood_level: 3,
      mood_description: undefined,
      feelings: undefined,
    });
  });

  it('avisa que humor, sentimentos e nota são compartilhados com o profissional', async () => {
    const user = userEvent.setup();
    render(<MoodCheckIn />, { wrapper });

    await user.click(screen.getByRole('radio', { name: 'Feliz' }));

    expect(
      screen.getByText(
        'Seu humor, os sentimentos marcados e a nota ficam visíveis para o profissional vinculado a você. Seu diário nunca é compartilhado.',
      ),
    ).toBeInTheDocument();
  });
});
