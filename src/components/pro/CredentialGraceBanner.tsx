'use client';

import Link from 'next/link';
import type { Credential } from '@/lib/api/credentials';
import { daysUntilBadgeExpires } from '@/lib/credential';

export function CredentialGraceBanner({ credential }: { credential: Credential }) {
  const days = daysUntilBadgeExpires(credential);

  return (
    <div className="mb-6 rounded-lg border border-warning/30 bg-warning/5 p-4" role="status">
      <p className="text-sm font-medium text-warning">A revisão da sua credencial venceu.</p>
      <p className="mt-1 text-sm text-ink-soft">
        {days > 0
          ? `Em ${days} ${days === 1 ? 'dia' : 'dias'} o selo de verificado deixa de aparecer para seus pacientes. Seu atendimento continua normalmente.`
          : 'O selo de verificado pode deixar de aparecer para seus pacientes a qualquer momento. Seu atendimento continua normalmente.'}
      </p>
      <Link
        href="/pro/verificacao"
        className="mt-2 inline-block text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
      >
        Ver situação da credencial
      </Link>
    </div>
  );
}