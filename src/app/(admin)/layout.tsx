import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="admin">
      <AppShell kind="admin">{children}</AppShell>
    </RoleGuard>
  );
}