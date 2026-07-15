import { http } from '@/lib/http';
import type { User } from '@/lib/types';

export const accountApi = {
  /**
   * PUT /user/update — atualiza name, email e/ou password (todos opcionais).
   * Trocar a senha EXIGE current_password (validado contra o hash atual → 422
   * com erro em 'current_password' se não bater). Devolve { message, user }.
   * No web (sessão por cookie) a troca de senha não derruba a sessão atual.
   */
  update: (data: {
    name?: string;
    email?: string;
    password?: string;
    current_password?: string;
  }) => http.put<{ message: string; user: User }>('/user/update', data),

  /**
   * DELETE /user/delete — exclusão de conta (LGPD). Sem body e SEM confirmação
   * de senha no backend: a confirmação forte tem que vir da UI.
   */
  remove: () => http.delete<{ message: string }>('/user/delete'),
};