import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
import { ProVerificationGate } from '@/components/pro/ProVerificationGate';

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="pro">
      <AppShell kind="pro">
        <ProVerificationGate>{children}</ProVerificationGate>
      </AppShell>
    </RoleGuard>
  );
}