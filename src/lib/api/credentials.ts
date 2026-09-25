import { http } from '@/lib/http';

export type CredentialStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'expired';

export type Profession = 'psychologist' | 'psychiatrist';

export type Council = 'CRP' | 'CRM';

export const COUNCIL_BY_PROFESSION: Record<Profession, Council> = {
  psychologist: 'CRP',
  psychiatrist: 'CRM',
};

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export interface Credential {
  id: number;
  status: CredentialStatus;
  profession: Profession | null;
  council: Council | null;
  registration_number: string | null;
  registration_region: string | null;
  rqe_number: string | null;
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
   * POST /credentials — multipart com profession, registration_number,
   * registration_region e registration_document; psicólogo envia também
   * epsi_registered e epsi_document, psiquiatra pode enviar rqe_number.
   * O conselho é derivado da profissão pela API.
   * Serve tanto para a primeira submissão quanto para o reenvio após recusa
   * (o backend aceita a partir de 'pending' ou 'rejected'). Não usamos o
   * PUT /credentials porque PHP não parseia multipart em requisições PUT.
   */
  submit: (form: FormData) => http.post<Credential>('/credentials', form),
};