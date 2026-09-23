'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moodsApi, type CreateMoodInput } from '@/lib/api/moods';
import { ApiError } from '@/lib/http';
import { isToday, localDayKey } from '@/lib/date';

const MOODS_KEY = ['moods'] as const;

// Agora são vários registros por dia: per_page tem que caber a janela toda,
// senão o dia de hoje volta cortado pela paginação.
const PER_PAGE_PER_DAY = 10;

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
    queryFn: () => moodsApi.list({ from, to, per_page: days * PER_PAGE_PER_DAY }),
    select: (page) => page.data,
  });
}

/** Registros de hoje, do mais recente para o mais antigo. Olha a janela de 7 dias. */
export function useTodayMoods() {
  const { data: moods, ...rest } = useMoods(7);
  const today = (moods ?? [])
    .filter((m) => isToday(m.recorded_at))
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  return { todayMoods: today, moods: moods ?? [], ...rest };
}

export function useCreateMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMoodInput) => moodsApi.create(data),
    onSuccess: () => {
      // Janelas diferentes (7 e 30 dias) vivem em chaves diferentes —
      // invalida pelo prefixo pra recarregar todas, não sobrescreve uma fixa.
      queryClient.invalidateQueries({ queryKey: MOODS_KEY });
    },
  });
}

/** Traduz o erro da API em texto pro usuário. */
export function moodErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 422) {
    return error.message;
  }
  return 'Não foi possível registrar seu humor. Tente novamente.';
}