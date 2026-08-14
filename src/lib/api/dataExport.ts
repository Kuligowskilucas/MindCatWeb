import { http } from '@/lib/http';

export const dataExportApi = {
  export: (diaryPassword?: string) =>
    http.post<Record<string, unknown>>('/user/export', {
      diary_password: diaryPassword || undefined,
    }),
};
