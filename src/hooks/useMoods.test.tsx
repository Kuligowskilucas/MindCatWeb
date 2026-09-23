import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Mood } from '@/lib/types';
import type { Paginated } from '@/lib/api/moods';
import { useCreateMood, useMoods, useTodayMoods } from '@/hooks/useMoods';

const mocks = vi.hoisted(() => ({ create: vi.fn(), list: vi.fn() }));

vi.mock('@/lib/api/moods', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/moods')>();
  return {
    ...actual,
    moodsApi: { list: mocks.list, create: mocks.create, remove: vi.fn() },
  };
});

function mood(overrides: Partial<Mood> = {}): Mood {
  return {
    id: 1,
    user_id: 1,
    mood_level: 3,
    thought: 'pensamento',
    behavior: 'comportamento',
    recorded_at: '2026-08-03T10:00:00.000Z',
    created_at: '2026-08-03T10:00:00.000Z',
    updated_at: '2026-08-03T10:00:00.000Z',
    ...overrides,
  };
}

function page(data: Mood[]): Paginated<Mood> {
  return { data, current_page: 1, last_page: 1, total: data.length };
}

let qc: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  mocks.list.mockResolvedValue(page([]));
});

describe('useMoods — janela por dias', () => {
  it('usa uma queryKey por janela e pede per_page com folga pra vários registros por dia', async () => {
    renderHook(() => useMoods(30), { wrapper });

    await waitFor(() => expect(mocks.list).toHaveBeenCalled());

    expect(mocks.list).toHaveBeenCalledWith(expect.objectContaining({ per_page: 300 }));
    expect(qc.getQueryState(['moods', 30])).toBeDefined();
  });
});

describe('useTodayMoods', () => {
  it('devolve só os registros de hoje, do mais recente para o mais antigo', async () => {
    const todayAt = (hour: number) => {
      const d = new Date();
      d.setHours(hour, 0, 0, 0);
      return d.toISOString();
    };
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    mocks.list.mockResolvedValue(
      page([
        mood({ id: 1, recorded_at: todayAt(9) }),
        mood({ id: 2, recorded_at: ontem.toISOString() }),
        mood({ id: 3, recorded_at: todayAt(20) }),
      ]),
    );

    const { result } = renderHook(() => useTodayMoods(), { wrapper });

    await waitFor(() => expect(result.current.todayMoods).toHaveLength(2));
    expect(result.current.todayMoods.map((m) => m.id)).toEqual([3, 1]);
  });

  it('devolve lista vazia quando não há registro hoje', async () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    mocks.list.mockResolvedValue(page([mood({ id: 9, recorded_at: ontem.toISOString() })]));

    const { result } = renderHook(() => useTodayMoods(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.todayMoods).toEqual([]);
  });
});

describe('useCreateMood', () => {
  it('invalida o prefixo ["moods"] em vez de sobrescrever uma chave fixa', async () => {
    qc.setQueryData(['moods', 7], page([mood({ id: 10 })]));
    mocks.create.mockResolvedValueOnce(mood({ id: 11 }));

    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');

    const { result } = renderHook(() => useCreateMood(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        mood_level: 3,
        feelings: ['ansioso'],
        thought: 'pensamento',
        behavior: 'comportamento',
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['moods'] });
  });

  it('não quebra quando ainda não há página em cache', async () => {
    mocks.create.mockResolvedValueOnce(mood({ id: 12 }));

    const { result } = renderHook(() => useCreateMood(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        mood_level: 4,
        feelings: ['calmo'],
        thought: 'pensamento',
        behavior: 'comportamento',
      });
    });

    expect(mocks.create).toHaveBeenCalledTimes(1);
  });
});
