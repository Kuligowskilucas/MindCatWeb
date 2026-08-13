'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAuditApi } from '@/lib/api/adminAudit';

export function useAuditLogs(action?: string) {
  return useQuery({
    queryKey: ['admin-audit-logs', action ?? 'all'],
    queryFn: () => adminAuditApi.list(action),
    select: (page) => page.data,
  });
}
