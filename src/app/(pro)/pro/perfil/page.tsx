'use client';

import { AccountInfoForm } from '@/components/account/AccountInfoForm';
import { PasswordChangeForm } from '@/components/account/PasswordChangeForm';


export default function ProPerfilPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Perfil</h1>
        <p className="mt-1 text-sm text-ink-soft">Seus dados de conta.</p>
      </header>

      <AccountInfoForm />
      <PasswordChangeForm />
    </div>
  );
}