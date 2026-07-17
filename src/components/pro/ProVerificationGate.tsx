'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCredential } from '@/hooks/useCredential';
import { Spinner } from '@/components/ui/Spinner';

// Rotas que o pro AINDA NÃO aprovado pode acessar (submeter credencial e
// mexer no próprio perfil). As demais rotas de /pro exigem aprovação.
const ALLOWED_WHILE_UNVERIFIED = ['/pro/verificacao', '/pro/perfil'];

export function ProVerificationGate({ children }: { children: React.ReactNode }) {
  const { data: credential, isLoading, isError } = useCredential();
  const pathname = usePathname();
  const router = useRouter();

  const approved = credential?.status === 'approved';
  const allowed = ALLOWED_WHILE_UNVERIFIED.includes(pathname);

  useEffect(() => {
    if (isLoading || isError) return;
    if (!approved && !allowed) {
      router.replace('/pro/verificacao');
    }
  }, [isLoading, isError, approved, allowed, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" label="Carregando" />
      </div>
    );
  }

  if (isError) return <>{children}</>;

  if (!approved && !allowed) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" label="Redirecionando" />
      </div>
    );
  }

  return <>{children}</>;
}