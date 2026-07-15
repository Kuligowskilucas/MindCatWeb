import { http } from '@/lib/http';
import type { Task } from '@/lib/types';

/** GET /tasks é paginado no Laravel (paginate(30)). */
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export const tasksApi = {
  /**
   * GET /tasks — pro paciente o backend ignora o scope e devolve sempre as
   * próprias tarefas (ativas e concluídas), ordenadas da mais recente.
   */
  list: () => http.get<Paginated<Task>>('/tasks'),

  /**
   * PATCH /tasks/{id}/done — marca como feita. Sem body; devolve a Task
   * atualizada (status='done', completed_at). É IRREVERSÍVEL pelo paciente:
   * não existe rota pra desmarcar (só o pro pode excluir, na Fase 4).
   */
  markDone: (id: number) => http.patch<Task>(`/tasks/${id}/done`),
};