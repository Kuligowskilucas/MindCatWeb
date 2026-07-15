import { http } from '@/lib/http';
import type { UserProfile } from '@/lib/types';

export const profileApi = {
  /** GET /profile — traz o profile do usuário logado, com has_diary_password. */
  show: () => http.get<UserProfile>('/profile'),

  /**
   * PUT /profile — a API só aceita consent_share_with_professional (as outras
   * preferências do profile não têm caminho de update). Devolve o profile.
   */
  updateConsent: (consent_share_with_professional: boolean) =>
    http.put<UserProfile>('/profile', { consent_share_with_professional }),

  /**
   * PUT /profile/diary-password — cria ou troca a senha do diário.
   * O backend só EXIGE current_password quando já existe uma senha
   * (SetDiaryPasswordRequest: current_password é 'sometimes'). No primeiro
   * cadastro, mande só new_password. new_password segue a regra StrongPassword.
   * Resposta é apenas { message } — NÃO devolve o profile, então quem chama
   * precisa invalidar a query ['profile'] pra has_diary_password virar true.
   */
  setDiaryPassword: (data: { new_password: string; current_password?: string }) =>
    http.put<{ message: string }>('/profile/diary-password', data),
};