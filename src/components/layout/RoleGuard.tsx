'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, homeFor } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import type { Role } from '@/lib/types';

interface RoleGuardProps {
  allow: Role;
  children: React.ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== allow) {
      router.replace(homeFor(user.role));
    }
  }, [user, initializing, allow, router]);

  if (initializing || !user || user.role !== allow) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" label="Carregando" />
      </div>
    );
  }

  return <>{children}</>;
}