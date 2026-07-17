import { http } from '@/lib/http';
import type { Paginated } from '@/lib/api/tasks';
import type { CredentialStatus } from '@/lib/api/credentials';

export interface AdminQueueItem {
  id: number;
  status: CredentialStatus;
  crp_number: string | null;
  submitted_at: string | null;
  user: { id: number; name: string; email: string };
}

export interface AdminCredentialDocument {
  id: number;
  kind: string;
  original_name: string;
  mime: string | null;
  size: number | null;
  url: string;
}

export interface AdminCredentialDetail {
  credential: {
    id: number;
    status: CredentialStatus;
    crp_number: string | null;
    crp_region: string | null;
    epsi_registered: boolean;
    rejection_reason: string | null;
    submitted_at: string | null;
    verified_at: string | null;
    user?: { id: number; name: string; email: string };
  };
  documents: AdminCredentialDocument[];
}

export const adminCredentialsApi = {
  queue: (status: CredentialStatus = 'submitted') =>
    http.get<Paginated<AdminQueueItem>>(`/admin/credentials?status=${status}`),
  detail: (id: number) => http.get<AdminCredentialDetail>(`/admin/credentials/${id}`),
  approve: (id: number) => http.post<unknown>(`/admin/credentials/${id}/approve`),
  reject: (id: number, reason: string) =>
    http.post<unknown>(`/admin/credentials/${id}/reject`, { reason }),
};