'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moodsApi } from '@/lib/api/moods';
import { ApiError } from '@/lib/http';
import { isToday } from '@/lib/date';
import type { Mood, MoodLevel } from '@/lib/types';

const MOODS_KEY = ['moods'] as const;

export function useMoods() {
  return useQuery({
    queryKey: MOODS_KEY,
    queryFn: () => moodsApi.list(),
    select: (page) => page.data,
  });
}

/** Já existe registro de humor para hoje? */
export function useTodayMood() {
  const { data: moods, ...rest } = useMoods();
  const today = moods?.find((m) => isToday(m.recorded_at)) ?? null;
  return { todayMood: today, moods: moods ?? [], ...rest };
}

export function useCreateMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { mood_level: MoodLevel; mood_description?: string }) =>
      moodsApi.create(data),
    onSuccess: (created) => {
      queryClient.setQueryData<Mood[]>(MOODS_KEY, (old) =>
        old ? [created, ...old] : [created],
      );
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