import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
import { CredentialNotice } from '@/components/pro/CredentialNotice';

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="pro">
      <AppShell kind="pro">
        <CredentialNotice />
        {children}
      </AppShell>
    </RoleGuard>
  );
}
