import { http } from '@/lib/http';

export interface InviteData {
  code: string;
  expires_at: string;
}

export const invitesApi = {
  current: () => http.get<{ invite: InviteData | null }>('/invites'),

  generate: () => http.post<InviteData>('/invites'),

  revoke: () => http.delete<{ message: string }>('/invites'),

  redeem: (code: string) => http.post<unknown>('/invites/redeem', { code }),
};