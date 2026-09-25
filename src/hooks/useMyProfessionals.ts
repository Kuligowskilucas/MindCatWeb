'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { professionalsApi } from '@/lib/api/professionals';
import { ApiError } from '@/lib/http';

const MY_PROFESSIONALS_KEY = ['my-professionals'] as const;

export function useMyProfessionals() {
  return useQuery({
    queryKey: MY_PROFESSIONALS_KEY,
    queryFn: () => professionalsApi.list(),
    select: (res) => res.data,
  });
}

export function useUnlinkProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proId: number) => professionalsApi.unlink(proId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_PROFESSIONALS_KEY }),
  });
}

export function myProfessionalsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) return 'Esse vínculo já não está ativo.';
    if (error.status === 429) return 'Muitas tentativas seguidas. Aguarde um instante.';
  }
  return 'Algo deu errado. Tente novamente.';
}
