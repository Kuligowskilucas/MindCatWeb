import { http } from '@/lib/http';
import type { Paginated } from '@/lib/api/tasks';

export interface AuditLogActor {
  id: number;
  name: string;
  email: string;
}

export interface AuditLogItem {
  id: number;
  action: string;
  actor: AuditLogActor | null;
  auditable_type: string | null;
  auditable_id: number | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export const adminAuditApi = {
  list: (action?: string) =>
    http.get<Paginated<AuditLogItem>>(
      action
        ? `/admin/audit-logs?action=${encodeURIComponent(action)}`
        : '/admin/audit-logs',
    ),
};
