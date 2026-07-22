import { http } from '@/lib/http';
import type { Paginated } from '@/lib/api/tasks';

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
 * Humor no resumo. O backend devolve o model UserMoodTracking cru (limit 14,
 * mais recentes primeiro), então tipo só os campos que a tela usa.
 */
export interface SummaryMood {
  id: number;
  user_id: number;
  mood_level: number;
  recorded_at: string;
}

/**
 * Entrada de diário no resumo: SÓ id e data. O conteúdo do diário NUNCA é
 * exposto ao profissional (o backend faz select('id','created_at')). A tela
 * respeita isso: mostra quando o paciente escreveu, jamais o texto.
 */
export interface SummaryDiaryEntry {
  id: number;
  created_at: string;
}

export interface PatientSummary {
  patient: { id: number; name: string };
  /** Até 14 registros recentes. NÃO é o total histórico. */
  moods: SummaryMood[];
  /** Contagem real de exercícios concluídos (não é limitada). */
  exercises_completed: number;
  /** Até 10 entradas recentes (id + data). NÃO é o total histórico. */
  diary: SummaryDiaryEntry[];
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
   */
  summary: (patientId: number) =>
    http.get<PatientSummary>(`/patients/${patientId}/summary`),
};