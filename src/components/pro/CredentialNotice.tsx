'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCredential } from '@/hooks/useCredential';
import { CredentialGraceBanner } from '@/components/pro/CredentialGraceBanner';
import { isCredentialActive, isReviewOverdue } from '@/lib/credential';

const VERIFICATION_PATH = '/pro/verificacao';

export function CredentialNotice() {
  const { data: credential, isLoading, isError } = useCredential();
  const pathname = usePathname();

  if (isLoading || isError || !credential || pathname === VERIFICATION_PATH) return null;

  if (isCredentialActive(credential)) {
    return isReviewOverdue(credential) ? <CredentialGraceBanner credential={credential} /> : null;
  }

  const inReview = credential.status === 'submitted' || credential.status === 'under_review';

  return (
    <p className="mb-6 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink-soft" role="status">
      {inReview
        ? 'Seu registro está em análise. Até a aprovação, seus pacientes veem "Registro não verificado".'
        : 'Seu registro profissional ainda não foi verificado. Seus pacientes veem "Registro não verificado".'}{' '}
      <Link
        href={VERIFICATION_PATH}
        className="font-medium text-purple-600 transition-colors hover:text-purple-700"
      >
        {inReview ? 'Ver verificação' : 'Verificar registro'}
      </Link>
    </p>
  );
}
