'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminCredentialsApi } from '@/lib/api/adminCredentials';
import type { CredentialStatus } from '@/lib/api/credentials';
import { ApiError } from '@/lib/http';

export function useAdminQueue(status: CredentialStatus) {
  return useQuery({
    queryKey: ['admin-credentials', status],
    queryFn: () => adminCredentialsApi.queue(status),
    select: (page) => page.data,
  });
}

export function useAdminCredentialDetail(id: number) {
  return useQuery({
    queryKey: ['admin-credential', id],
    queryFn: () => adminCredentialsApi.detail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useApproveCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminCredentialsApi.approve(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['admin-credential', id] });
    },
  });
}

export function useRejectCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminCredentialsApi.reject(id, reason),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-credentials'] });
      queryClient.invalidateQueries({ queryKey: ['admin-credential', id] });
    },
  });
}

export function adminCredentialErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return 'Esta credencial não está mais aguardando análise.';
    if (error.status === 422) return error.message;
  }
  return 'Não foi possível concluir. Tente novamente.';
}