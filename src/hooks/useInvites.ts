'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitesApi } from '@/lib/api/invites';
import { ApiError } from '@/lib/http';

const INVITE_KEY = ['invite'] as const;
const PATIENTS_KEY = ['patients'] as const;

export function useActiveInvite() {
  return useQuery({
    queryKey: INVITE_KEY,
    queryFn: () => invitesApi.current(),
    select: (res) => res.invite,
  });
}

export function useGenerateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invitesApi.generate(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVITE_KEY }),
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invitesApi.revoke(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: INVITE_KEY }),
  });
}

export function useRedeemInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => invitesApi.redeem(code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_KEY }),
  });
}

export function inviteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'Ative o compartilhamento de dados acima antes de gerar um convite.';
    }
    if (error.status === 429) return 'Muitas tentativas seguidas. Aguarde um instante.';
  }
  return 'Algo deu errado. Tente novamente.';
}

export function redeemErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      return 'Código inválido ou expirado. Peça um novo ao paciente.';
    }
    if (error.status === 403) {
      return 'O paciente ainda não autorizou o compartilhamento de dados no app.';
    }
    if (error.status === 429) return 'Muitas tentativas seguidas. Aguarde um instante.';
  }
  return 'Algo deu errado. Tente novamente.';
}