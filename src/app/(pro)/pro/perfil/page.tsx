'use client';

import { AccountInfoForm } from '@/components/account/AccountInfoForm';
import { PasswordChangeForm } from '@/components/account/PasswordChangeForm';
import { TwoFactorCard } from '@/components/account/TwoFactorCard';
import { DangerZone } from '@/components/account/DangerZone';

const PRO_DELETE_DESCRIPTION = (
  <>
    Seus vínculos com pacientes são encerrados na hora: você deixa de ver
    os dados deles e eles deixam de ver você na lista de profissionais.
    Sua credencial e os documentos enviados para verificação são apagados.
    As tarefas que você passou continuam com seus pacientes, como registro
    do acompanhamento. Sua conta é anonimizada e desativada. Não dá para
    desfazer.
  </>
);

export default function ProPerfilPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Perfil</h1>
        <p className="mt-1 text-sm text-ink-soft">Seus dados de conta.</p>
      </header>

      <AccountInfoForm />
      <PasswordChangeForm />
      <TwoFactorCard />
      <DangerZone description={PRO_DELETE_DESCRIPTION} />
    </div>
  );
}