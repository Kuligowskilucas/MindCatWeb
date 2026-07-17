'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ChevronRightIcon } from '@/components/icons';
import { useAdminQueue } from '@/hooks/useAdminCredentials';
import type { CredentialStatus } from '@/lib/api/credentials';

const FILTERS: { label: string; value: CredentialStatus }[] = [
  { label: 'Pendentes', value: 'submitted' },
  { label: 'Aprovadas', value: 'approved' },
  { label: 'Recusadas', value: 'rejected' },
];

export default function AdminPage() {
  const [status, setStatus] = useState<CredentialStatus>('submitted');
  const { data: items, isLoading, isError, refetch } = useAdminQueue(status);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Validação de credenciais</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Analise os registros e aprove ou recuse os profissionais.
        </p>
      </header>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              status === f.value
                ? 'bg-purple-100 text-purple-700'
                : 'text-ink-soft hover:bg-purple-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-14">
          <Spinner size="lg" label="Carregando" />
        </div>
      ) : isError ? (
        <Card>
          <EmptyState
            title="Não foi possível carregar"
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Tentar de novo
              </Button>
            }
          />
        </Card>
      ) : !items || items.length === 0 ? (
        <Card>
          <EmptyState title="Nada por aqui" description="Nenhuma credencial neste status." />
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <Card as="li" key={it.id}>
              <Link
                href={`/admin/credencial/${it.id}`}
                className="group flex items-center gap-3 px-4 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink group-hover:text-purple-600">
                    {it.user.name}
                  </span>
                  <span className="block truncate text-xs text-ink-faint">
                    {it.user.email}
                    {it.crp_number ? ` · CRP ${it.crp_number}` : ''}
                  </span>
                </span>
                <ChevronRightIcon aria-hidden className="h-5 w-5 shrink-0 text-ink-faint" />
              </Link>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}