import { http } from '@/lib/http';
import type { Paginated } from '@/lib/api/tasks';
import type { Feeling } from '@/lib/types';

// Reaproveito o Paginated de tasks.ts — é o mesmo shape do paginate() do Laravel.
export type { Paginated };

/**
 * Item de GET /patients. É um `User` vindo de belongsToMany, então traz o
 * objeto `pivot` junto; não usamos o pivot no front, por isso não tipamos.
 */
export interface PatientListItem {
  id: number;
  name: string;
  email: string;
}

/**
 * Humor no resumo. O backend devolve o model UserMoodTracking cru, filtrado
 * pela janela de `range_days` e com `feelings` carregado (mais recentes primeiro).
 */
export interface SummaryMood {
  id: number;
  user_id: number;
  mood_level: number;
  mood_description: string | null;
  recorded_at: string;
  feelings?: Feeling[];
}

export interface FeelingFrequency {
  slug: string;
  label: string;
  count: number;
}

export interface PatientSummary {
  patient: { id: number; name: string };
  /** Tamanho da janela (em dias) usada para filtrar moods e feelings_frequency. */
  range_days: number;
  moods: SummaryMood[];
  /** Sentimentos marcados na janela, já ordenados por contagem desc. */
  feelings_frequency: FeelingFrequency[];
  /** Contagem real de exercícios concluídos (não é limitada). */
  exercises_completed: number;
}

export const patientsApi = {
  /** GET /patients — paginado, já filtrado por consentimento no backend. */
  list: () => http.get<Paginated<PatientListItem>>('/patients'),

  /** DELETE /links/{patientId} — desativa (active=false); paciente some da lista. */
  unlink: (patientId: number) =>
    http.delete<{ message: string }>(`/links/${patientId}`),

  /**
   * GET /patients/{id}/summary — 403 se o paciente revogou o consentimento
   * DEPOIS de vinculado (o Gate view-patient checa vínculo E consentimento).
   * `days` filtra a janela no backend (min 7, max 90; fora disso cai no padrão de 30).
   */
  summary: (patientId: number, days?: number) => {
    const suffix = days ? `?days=${days}` : '';
    return http.get<PatientSummary>(`/patients/${patientId}/summary${suffix}`);
  },
};