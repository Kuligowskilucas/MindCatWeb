'use client';

import { AccountInfoForm } from '@/components/account/AccountInfoForm';
import { PasswordChangeForm } from '@/components/account/PasswordChangeForm';
import { ConsentCard } from '@/components/account/ConsentCard';
import { InviteCard } from '@/components/account/InviteCard';
import { DangerZone } from '@/components/account/DangerZone';

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Perfil</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Seus dados de conta e preferências de privacidade.
        </p>
      </header>

      <AccountInfoForm />
      <PasswordChangeForm />
      <ConsentCard />
      <InviteCard />
      <DangerZone />
    </div>
  );
}