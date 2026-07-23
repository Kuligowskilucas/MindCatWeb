'use client';

import Link from 'next/link';
import type { Credential } from '@/lib/api/credentials';
import { daysUntilBlock } from '@/lib/credential';

export function CredentialGraceBanner({ credential }: { credential: Credential }) {
  const days = daysUntilBlock(credential);

  return (
    <div className="mb-6 rounded-lg border border-warning/30 bg-warning/5 p-4" role="status">
      <p className="text-sm font-medium text-warning">A revisão da sua credencial venceu.</p>
      <p className="mt-1 text-sm text-ink-soft">
        {days > 0
          ? `Em ${days} ${days === 1 ? 'dia' : 'dias'} o acesso aos seus pacientes será bloqueado até que você reenvie os documentos.`
          : 'O acesso aos seus pacientes será bloqueado a qualquer momento até que você reenvie os documentos.'}
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