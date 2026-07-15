'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { diaryApi } from '@/lib/api/diary';
import { profileApi } from '@/lib/api/profile';
import { ApiError } from '@/lib/http';
import type { DiaryEntry } from '@/lib/types';

const PROFILE_KEY = ['profile'] as const;
const DIARY_KEY = ['diary', 'entries'] as const;

/** Perfil do usuário — usamos por causa de has_diary_password. */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => profileApi.show(),
  });
}

/**
 * Destrava o diário: tenta LISTAR com a senha digitada. Se der certo, a senha
 * está correta; semeamos o cache de entradas com o resultado pra o Reader não
 * precisar refazer um segundo POST (o que também gastaria o throttle 5/min).
 * Se a senha estiver errada, a API responde 403 e a mutation rejeita.
 */
export function useUnlockDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => diaryApi.list(password),
    onSuccess: (entries) => {
      queryClient.setQueryData<DiaryEntry[]>(DIARY_KEY, entries);
    },
  });
}

/**
 * Lista as entradas. Só roda quando há senha em memória (destravado).
 * staleTime alto porque o cache já vem semeado pelo unlock; sem isso o
 * React Query dispararia um refetch (2º POST) logo no mount do Reader.
 * Depois de criar/excluir, invalidamos DIARY_KEY pra forçar o refetch.
 */
export function useDiaryEntries(password: string | null) {
  return useQuery({
    queryKey: DIARY_KEY,
    queryFn: () => diaryApi.list(password as string),
    enabled: !!password,
    staleTime: 60_000,
  });
}

/** Escreve uma entrada. Não exige senha. Invalida a lista pra recarregar. */
export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => diaryApi.create(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIARY_KEY });
    },
  });
}

/** Exclui uma entrada (definitivo no backend). Exige a senha em memória. */
export function useDeleteDiaryEntry(password: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => diaryApi.remove(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIARY_KEY });
    },
  });
}

/** Cria/troca a senha do diário. Invalida o profile pra has_diary_password atualizar. */
export function useSetDiaryPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { new_password: string; current_password?: string }) =>
      profileApi.setDiaryPassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

/** Traduz o erro da API em texto pro usuário. */
export function diaryErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // 403 = senha do diário errada (tanto no list quanto no delete).
    if (error.status === 403) return 'Senha do diário incorreta.';
    // 429 = throttle 5/min. A mensagem crua do Laravel é em inglês; trocamos.
    if (error.status === 429) {
      return 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.';
    }
    if (error.status === 422) return error.message;
  }
  return 'Algo deu errado. Tente novamente.';
}