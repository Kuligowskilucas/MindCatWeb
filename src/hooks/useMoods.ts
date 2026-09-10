'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moodsApi } from '@/lib/api/moods';
import { ApiError } from '@/lib/http';
import { isToday, localDayKey } from '@/lib/date';
import type { MoodLevel } from '@/lib/types';

const MOODS_KEY = ['moods'] as const;

/** [hoje - (days-1), hoje], no formato YYYY-MM-DD que a API espera. */
function rangeFor(days: 7 | 30): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: localDayKey(from), to: localDayKey(to) };
}

export function useMoods(days: 7 | 30 = 7) {
  const { from, to } = rangeFor(days);
  return useQuery({
    queryKey: [...MOODS_KEY, days] as const,
    // Um registro por dia no máximo: per_page = days cobre a janela inteira sem paginar.
    queryFn: () => moodsApi.list({ from, to, per_page: days }),
    select: (page) => page.data,
  });
}

/** Já existe registro de humor para hoje? Sempre olha a janela de 7 dias. */
export function useTodayMood() {
  const { data: moods, ...rest } = useMoods(7);
  const today = moods?.find((m) => isToday(m.recorded_at)) ?? null;
  return { todayMood: today, moods: moods ?? [], ...rest };
}

export function useCreateMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { mood_level: MoodLevel; mood_description?: string; feelings?: string[] }) =>
      moodsApi.create(data),
    onSuccess: () => {
      // Janelas diferentes (7 e 30 dias) vivem em chaves diferentes —
      // invalida pelo prefixo pra recarregar todas, não sobrescreve uma fixa.
      queryClient.invalidateQueries({ queryKey: MOODS_KEY });
    },
  });
}

/** Traduz o erro da API em texto pro usuário. */
export function moodErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'Você já registrou seu humor hoje.';
    if (error.status === 422) return error.message;
  }
  return 'Não foi possível registrar seu humor. Tente novamente.';
}