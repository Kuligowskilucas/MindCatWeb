'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi, type Paginated } from '@/lib/api/tasks';
import { ApiError } from '@/lib/http';
import type { Task } from '@/lib/types';

const TASKS_KEY = ['tasks'] as const;

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: () => tasksApi.list(),
    select: (page) => page.data,
  });
}

export function useMarkTaskDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tasksApi.markDone(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<Paginated<Task>>(TASKS_KEY, (old) =>
        old
          ? { ...old, data: old.data.map((t) => (t.id === updated.id ? updated : t)) }
          : old,
      );
    },
  });
}

/** Traduz o erro da API em texto pro usuário. */
export function taskErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Você não tem permissão para essa tarefa.';
    if (error.status === 422) return error.message;
  }
  return 'Não foi possível atualizar a tarefa. Tente novamente.';
}