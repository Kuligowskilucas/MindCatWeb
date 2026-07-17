'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { credentialsApi } from '@/lib/api/credentials';
import { ApiError } from '@/lib/http';

const CREDENTIAL_KEY = ['credential'] as const;

export function useCredential() {
  return useQuery({
    queryKey: CREDENTIAL_KEY,
    queryFn: () => credentialsApi.me(),
  });
}

export function useSubmitCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => credentialsApi.submit(form),
    onSuccess: () => {
      // Atualiza o status (submitted) e libera/atualiza o gate do painel.
      queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEY });
    },
  });
}

export function credentialErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'Sua credencial já está em análise ou aprovada.';
    if (error.status === 422) return error.message;
    if (error.status === 429) return 'Muitas tentativas. Aguarde um minuto.';
  }
  return 'Não foi possível enviar. Tente novamente.';
}