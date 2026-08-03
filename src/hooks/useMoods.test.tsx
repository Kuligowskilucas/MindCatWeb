import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { Mood } from '@/lib/types';
import type { Paginated } from '@/lib/api/moods';
import { useCreateMood } from '@/hooks/useMoods';

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
    mood_description: null,
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

describe('useCreateMood — regressão do formato Paginated<T>', () => {
  it('insere o humor novo em old.data e incrementa total (cache não é array plano)', async () => {
    const existing = mood({ id: 10, recorded_at: '2026-08-01T10:00:00.000Z' });
    qc.setQueryData(['moods'], page([existing]));

    mocks.create.mockResolvedValueOnce(mood({ id: 11 }));

    const { result } = renderHook(() => useCreateMood(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ mood_level: 3 });
    });

    const cache = qc.getQueryData<Paginated<Mood>>(['moods'])!;
    expect(Array.isArray(cache.data)).toBe(true);
    expect(cache.data.map((m) => m.id)).toEqual([11, 10]);
    expect(cache.total).toBe(2);
  });

  it('não quebra quando ainda não há página em cache (old undefined)', async () => {
    mocks.create.mockResolvedValueOnce(mood({ id: 12 }));

    const { result } = renderHook(() => useCreateMood(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ mood_level: 4 });
    });

    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(qc.getQueryData(['moods'])).toBeUndefined();
  });
});