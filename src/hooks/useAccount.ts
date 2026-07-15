'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '@/lib/api/account';
import { profileApi } from '@/lib/api/profile';
import { ApiError } from '@/lib/http';
import type { UserProfile } from '@/lib/types';

// A query do profile mora no useDiary (has_diary_password). Reexporto aqui pra
// as telas de conta importarem tudo de account de um lugar só.
export { useProfile } from './useDiary';

export function useUpdateAccount() {
  return useMutation({
    mutationFn: (data: {
      name?: string;
      email?: string;
      password?: string;
      current_password?: string;
    }) => accountApi.update(data),
  });
}

export function useUpdateConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: boolean) => profileApi.updateConsent(value),
    onSuccess: (profile) => {
      // A resposta é o profile atualizado: grava direto no cache, sem refetch.
      queryClient.setQueryData<UserProfile>(['profile'], profile);
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => accountApi.remove(),
  });
}

/** Traduz o erro da API em texto pro usuário. */
export function accountErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 422) return error.message;
    if (error.status === 403) return 'Você não tem permissão para isso.';
  }
  return 'Não foi possível concluir. Tente novamente.';
}