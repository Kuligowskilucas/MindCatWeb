'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api/patients';
import { ApiError } from '@/lib/http';

const PATIENTS_KEY = ['patients'] as const;

export function usePatients() {
  return useQuery({
    queryKey: PATIENTS_KEY,
    queryFn: () => patientsApi.list(),
    select: (page) => page.data,
  });
}

export function usePatientSummary(patientId: number) {
  return useQuery({
    queryKey: ['patient-summary', patientId],
    queryFn: () => patientsApi.summary(patientId),
    // id inválido na URL (ex.: /pro/paciente/abc) → não dispara request.
    enabled: Number.isFinite(patientId) && patientId > 0,
    // 403 (consentimento revogado) e 404 são respostas legítimas, não falhas
    // de rede: não adianta re-tentar, a tela trata cada uma.
    retry: (count, error) => {
      if (error instanceof ApiError && [403, 404].includes(error.status)) {
        return false;
      }
      return count < 2;
    },
  });
}

export function useLinkPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patientId: number) => patientsApi.link(patientId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY }),
  });
}

export function useUnlinkPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patientId: number) => patientsApi.unlink(patientId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY }),
  });
}

/** Traduz o erro da API em texto pro usuário. */
export function patientErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) return 'Nenhum paciente encontrado com esse email.';
    if (error.status === 403) {
      return 'O paciente ainda não autorizou o compartilhamento de dados.';
    }
    if (error.status === 422) return error.message;
    if (error.status === 429) return 'Muitas buscas seguidas. Aguarde um instante.';
  }
  return 'Algo deu errado. Tente novamente.';
}