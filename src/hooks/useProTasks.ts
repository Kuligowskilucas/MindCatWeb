'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proTasksApi } from '@/lib/api/tasks';
import { ApiError } from '@/lib/http';


const PRO_TASKS_KEY = ['pro-tasks'] as const;

export function useProTasks() {
  return useQuery({
    queryKey: PRO_TASKS_KEY,
    queryFn: () => proTasksApi.listAssigned(),
    select: (page) => page.data,
  });
}

export function useCreateProTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, title }: { patientId: number; title: string }) =>
      proTasksApi.create(patientId, title),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRO_TASKS_KEY }),
  });
}

export function useDeleteProTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => proTasksApi.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRO_TASKS_KEY }),
  });
}

/** Traduz o erro da API em texto pro usuário. */
export function proTaskErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return 'Sem acesso a esse paciente. O consentimento pode ter sido revogado.';
    }
    if (error.status === 422) return error.message;
  }
  return 'Não foi possível concluir. Tente novamente.';
}