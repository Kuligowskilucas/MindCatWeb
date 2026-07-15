import { http } from '@/lib/http';
import type { DiaryEntry } from '@/lib/types';

export const diaryApi = {
  /**
   * POST /diary/list — LER exige a senha do diário no corpo (403 se errada).
   * A resposta é um ARRAY puro: DiaryService::index faz ->latest()->get(),
   * NÃO é paginado (diferente de /moods). Por isso o tipo é DiaryEntry[].
   * Rota com throttle:5,1 no backend.
   */
  list: (diary_password: string) =>
    http.post<DiaryEntry[]>('/diary/list', { diary_password }),

  /**
   * POST /diary — ESCREVER não exige senha (desabafo rápido é livre).
   * Backend responde { message, entry }.
   */
  create: (content: string) =>
    http.post<{ message: string; entry: DiaryEntry }>('/diary', { content }),

  /**
   * DELETE /diary/{id} — EXCLUIR exige a senha no corpo (403 se errada).
   * No backend é forceDelete: a exclusão é definitiva. throttle:5,1.
   */
  remove: (id: number, diary_password: string) =>
    http.delete<{ message: string }>(`/diary/${id}`, { diary_password }),
};