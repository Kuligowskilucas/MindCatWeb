'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { VerifiedIcon } from '@/components/icons';
import type { LinkedProfessional, ProfessionalBadge } from '@/lib/api/professionals';
import {
  useMyProfessionals,
  useUnlinkProfessional,
  myProfessionalsErrorMessage,
} from '@/hooks/useMyProfessionals';

export function MyProfessionalsList() {
  const { data: professionals, isLoading, isError, refetch } = useMyProfessionals();
  const unlink = useUnlinkProfessional();
  const toast = useToast();
  const [target, setTarget] = useState<LinkedProfessional | null>(null);

  async function handleUnlink() {
    if (!target) return;
    try {
      await unlink.mutateAsync(target.id);
      toast.success(`${target.name} foi desvinculado(a).`);
      setTarget(null);
    } catch (err) {
      toast.error(myProfessionalsErrorMessage(err));
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-14">
        <Spinner size="lg" label="Carregando" />
      </div>
    );
  }

  if (isError || !professionals) {
    return (
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
    );
  }

  if (professionals.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum profissional vinculado"
          description="Gere um código de convite no seu perfil e envie ao seu terapeuta para ele se vincular."
          action={
            <Link href="/perfil">
              <Button variant="secondary">Ir para o convite</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {professionals.map((pro) => (
          <Card as="li" key={pro.id}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{pro.name}</p>
                <BadgeLabel badge={pro.badge} />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setTarget(pro)}
                aria-label={`Desvincular ${pro.name}`}
              >
                Desvincular
              </Button>
            </div>
          </Card>
        ))}
      </ul>

      <Dialog
        open={target !== null}
        onClose={() => setTarget(null)}
        title={target ? `Desvincular ${target.name}?` : 'Desvincular'}
        description={
          <>
            <p>
              {target?.name} deixa de ver seus dados no MindCat, como seus registros de humor e
              suas tarefas, e não poderá mais criar tarefas para você.
            </p>
            <p className="mt-2">
              Para voltar a compartilhar, gere um novo código de convite no seu perfil.
            </p>
          </>
        }
        confirmLabel="Desvincular"
        confirmVariant="danger"
        loading={unlink.isPending}
        onConfirm={handleUnlink}
      />
    </>
  );
}

function BadgeLabel({ badge }: { badge: ProfessionalBadge }) {
  if (!badge.verified) {
    return <p className="mt-0.5 text-xs text-ink-faint">Registro não verificado</p>;
  }

  return (
    <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-success">
      <VerifiedIcon aria-hidden className="h-4 w-4" />
      <span>{badge.label}</span>
      <span className="sr-only">(registro verificado)</span>
    </p>
  );
}
