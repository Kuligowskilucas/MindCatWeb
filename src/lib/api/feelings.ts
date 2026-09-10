import { http } from '@/lib/http';
import type { Feeling } from '@/lib/types';

export const feelingsApi = {
  list: () => http.get<Feeling[]>('/feelings'),
};
