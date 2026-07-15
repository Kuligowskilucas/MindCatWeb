import { http } from '@/lib/http';
import type { Mood, MoodLevel } from '@/lib/types';

/** GET /moods é paginado no Laravel. */
interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export const moodsApi = {
  list: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const suffix = qs.toString() ? `?${qs}` : '';
    return http.get<Paginated<Mood>>(`/moods${suffix}`);
  },

  create: (data: { mood_level: MoodLevel; mood_description?: string }) =>
    http.post<Mood>('/moods', data),

  remove: (id: number) => http.delete<{ message: string }>(`/moods/${id}`),
};