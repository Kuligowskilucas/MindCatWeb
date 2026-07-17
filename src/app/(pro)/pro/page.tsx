'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { usePatients, useUnlinkPatient, patientErrorMessage } from '@/hooks/usePatients';
import { AddPatientDialog } from '@/components/pro/AddPatientDialog';
import { PlusIcon, ChevronRightIcon } from '@/components/icons';
import type { PatientListItem } from '@/lib/api/patients';

export default function ProPacientesPage() {
  const { data: patients, isLoading, isError, refetch } = usePatients();
  const [addOpen, setAddOpen] = useState(false);
  const [toUnlink, setToUnlink] = useState<PatientListItem | null>(null);
  const unlink = useUnlinkPatient();
  const toast = useToast();

  async function confirmUnlink() {
    if (!toUnlink) return;
    try {
      await unlink.mutateAsync(toUnlink.id);
      toast.success('Vínculo removido.');
      setToUnlink(null);
    } catch (e) {
      toast.error(patientErrorMessage(e));
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Pacientes</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Pessoas que autorizaram você a acompanhar seus dados.
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <PlusIcon aria-hidden className="h-4 w-4" />
          Adicionar
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-14">
          <Spinner size="lg" label="Carregando pacientes" />
        </div>
      ) : isError ? (
        <Card>
          <EmptyState
            title="Não foi possível carregar"
            description="Verifique sua conexão e tente de novo."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Tentar de novo
              </Button>
            }
          />
        </Card>
      ) : !patients || patients.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum paciente ainda"
            description="Adicione um paciente pelo email. Ele precisa ter autorizado o compartilhamento de dados no app."
            action={<Button onClick={() => setAddOpen(true)}>Adicionar paciente</Button>}
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {patients.map((p) => (
            <Card as="li" key={p.id}>
              <div className="flex items-center gap-2 px-4 py-3">
                <Link href={`/pro/paciente/${p.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600">
                    {initials(p.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink group-hover:text-purple-600">
                      {p.name}
                    </span> 
                    <span className="block truncate text-xs text-ink-faint">
                      {p.email}
                    </span>
                  </span>
                  <ChevronRightIcon
                    aria-hidden
                    className="ml-auto h-5 w-5 shrink-0 text-ink-faint"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setToUnlink(p)}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-danger/5 hover:text-danger"
                >
                  Desvincular
                </button>
              </div>
            </Card>
          ))}
        </ul>
      )}

      <AddPatientDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <Dialog
        open={toUnlink !== null}
        onClose={() => setToUnlink(null)}
        title="Desvincular paciente?"
        description={
          toUnlink ? `${toUnlink.name} deixará de aparecer aqui. O histórico e as tarefas são preservados — você pode vincular de novo depois.` : ''
        }
        confirmLabel="Desvincular"
        confirmVariant="danger"
        loading={unlink.isPending}
        onConfirm={confirmUnlink}
      />
    </div>
  );
}

/** Iniciais para o avatar (primeiro + último nome). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}