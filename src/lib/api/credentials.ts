import { http } from '@/lib/http';

export type CredentialStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'expired';

export interface Credential {
  id: number;
  status: CredentialStatus;
  crp_number: string | null;
  crp_region: string | null;
  epsi_registered: boolean;
  rejection_reason: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  next_review_at: string | null;
}

export const credentialsApi = {
  /** GET /credentials/me — cria um rascunho 'pending' na primeira consulta. */
  me: () => http.get<Credential>('/credentials/me'),

  /**
   * POST /credentials — envia CRP, e-Psi e os dois documentos (multipart).
   * Serve tanto para a primeira submissão quanto para o reenvio após recusa
   * (o backend aceita a partir de 'pending' ou 'rejected'). Não usamos o
   * PUT /credentials porque PHP não parseia multipart em requisições PUT.
   */
  submit: (form: FormData) => http.post<Credential>('/credentials', form),
};