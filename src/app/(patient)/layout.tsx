import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="patient">
      <AppShell kind="patient">{children}</AppShell>
    </RoleGuard>
  );
}