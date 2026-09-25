import { http } from '@/lib/http';

export interface ProfessionalBadge {
  verified: boolean;
  label: string;
}

export interface LinkedProfessional {
  id: number;
  name: string;
  badge: ProfessionalBadge;
}

export const professionalsApi = {
  /** GET /my-professionals — pros com vínculo ativo; a API nunca devolve email nem registro. */
  list: () => http.get<{ data: LinkedProfessional[] }>('/my-professionals'),

  unlink: (proId: number) => http.delete<{ message: string }>(`/my-professionals/${proId}`),
};
