import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Mood } from '@/lib/types';
import { MoodCheckIn } from './MoodCheckIn';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  todayMoods: [] as Mood[],
}));

vi.mock('@/hooks/useMoods', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useMoods')>();
  return {
    ...actual,
    useTodayMoods: () => ({ todayMoods: mocks.todayMoods, moods: mocks.todayMoods, isLoading: false }),
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

/** Preenche os quatro campos; `skip` deixa um de fora de propósito. */
async function fill(
  user: ReturnType<typeof userEvent.setup>,
  skip?: 'mood_level' | 'feelings' | 'thought' | 'behavior',
) {
  if (skip !== 'mood_level') {
    await user.click(screen.getByRole('radio', { name: 'Feliz' }));
  }
  if (skip !== 'feelings') {
    await user.click(screen.getByRole('button', { name: 'Ansioso' }));
  }
  if (skip !== 'thought') {
    await user.type(
      screen.getByLabelText('O que você estava pensando?'),
      'Achei que não ia dar conta da reunião.',
    );
  }
  if (skip !== 'behavior') {
    await user.type(screen.getByLabelText('O que você fez?'), 'Respirei fundo e falei mesmo assim.');
  }
}

function mood(overrides: Partial<Mood> = {}): Mood {
  const iso = new Date().toISOString();
  return {
    id: 1,
    user_id: 1,
    mood_level: 3,
    thought: 'Achei que ia dar tudo errado.',
    behavior: 'Fui até o fim mesmo assim.',
    recorded_at: iso,
    created_at: iso,
    updated_at: iso,
    ...overrides,
  };
}

beforeEach(() => {
  mocks.mutateAsync.mockReset();
  mocks.toastSuccess.mockReset();
  mocks.todayMoods = [];
  mocks.mutateAsync.mockResolvedValue({ id: 1 });
});

describe('MoodCheckIn — validação', () => {
  it('não envia nada quando o formulário está vazio e cobra os quatro campos', async () => {
    const user = userEvent.setup();
    render(<MoodCheckIn />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    expect(screen.getByText('Escolha como você está se sentindo.')).toBeInTheDocument();
    expect(screen.getByText('Selecione ao menos um sentimento.')).toBeInTheDocument();
    expect(screen.getByText('Escreva o que você estava pensando.')).toBeInTheDocument();
    expect(screen.getByText('Escreva o que você fez.')).toBeInTheDocument();
  });

  it.each([
    ['mood_level', 'Escolha como você está se sentindo.'],
    ['feelings', 'Selecione ao menos um sentimento.'],
    ['thought', 'Escreva o que você estava pensando.'],
    ['behavior', 'Escreva o que você fez.'],
  ] as const)('bloqueia o envio quando falta %s', async (field, message) => {
    const user = userEvent.setup();
    render(<MoodCheckIn />, { wrapper });

    await fill(user, field);
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('não envia pensamento ou comportamento só com espaço em branco', async () => {
    const user = userEvent.setup();
    render(<MoodCheckIn />, { wrapper });

    await fill(user, 'thought');
    await user.type(screen.getByLabelText('O que você estava pensando?'), '   ');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    expect(screen.getByText('Escreva o que você estava pensando.')).toBeInTheDocument();
  });

  it('limpa o erro do campo quando ele é preenchido', async () => {
    const user = userEvent.setup();
    render(<MoodCheckIn />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Registrar' }));
    expect(screen.getByText('Escreva o que você fez.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('O que você fez?'), 'Fui caminhar.');

    expect(screen.queryByText('Escreva o que você fez.')).not.toBeInTheDocument();
  });
});

describe('MoodCheckIn — envio', () => {
  it('manda os quatro campos com o texto sem espaço nas pontas', async () => {
    const user = userEvent.setup();
    render(<MoodCheckIn />, { wrapper });

    await user.click(screen.getByRole('radio', { name: 'Feliz' }));
    await user.click(screen.getByRole('button', { name: 'Ansioso' }));
    await user.click(screen.getByRole('button', { name: 'Calmo' }));
    await user.type(screen.getByLabelText('O que você estava pensando?'), '  Não vou dar conta.  ');
    await user.type(screen.getByLabelText('O que você fez?'), '  Pedi ajuda.  ');
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      mood_level: 4,
      feelings: ['ansioso', 'calmo'],
      thought: 'Não vou dar conta.',
      behavior: 'Pedi ajuda.',
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Registro salvo. Cuide-se hoje.');
  });

  it('limpa o formulário depois de registrar', async () => {
    const user = userEvent.setup();
    render(<MoodCheckIn />, { wrapper });

    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(screen.getByRole('radio', { name: 'Feliz' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('button', { name: 'Ansioso' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByLabelText('O que você estava pensando?')).toHaveValue('');
    expect(screen.getByLabelText('O que você fez?')).toHaveValue('');
  });

  it('avisa que humor, sentimentos, pensamento e comportamento vão para o profissional', () => {
    render(<MoodCheckIn />, { wrapper });

    expect(
      screen.getByText(
        'Seu humor, os sentimentos marcados, o pensamento e o comportamento ficam visíveis para o profissional vinculado a você. Seu diário nunca é compartilhado.',
      ),
    ).toBeInTheDocument();
  });

  it('mostra o formulário mesmo quando já existe registro hoje', () => {
    mocks.todayMoods = [mood({ id: 7 })];

    render(<MoodCheckIn />, { wrapper });

    expect(screen.getByRole('button', { name: 'Registrar' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Feliz' })).toBeEnabled();
    expect(screen.getByLabelText('O que você estava pensando?')).toBeInTheDocument();
  });

  it('lista o registro de hoje abaixo do formulário', () => {
    mocks.todayMoods = [mood({ id: 7, thought: 'Ninguém vai notar.', behavior: 'Entreguei na hora.' })];

    render(<MoodCheckIn />, { wrapper });

    expect(screen.getByText('Ninguém vai notar.')).toBeInTheDocument();
    expect(screen.getByText('Entreguei na hora.')).toBeInTheDocument();
  });
});
