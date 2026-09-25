import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="pro">
      <AppShell kind="pro">{children}</AppShell>
    </RoleGuard>
  );
}
