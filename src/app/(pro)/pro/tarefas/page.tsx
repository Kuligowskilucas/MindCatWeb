'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { CreateTaskForm } from '@/components/pro/CreateTaskForm';
import { usePatients } from '@/hooks/usePatients';
import { useProTasks, useDeleteProTask, proTaskErrorMessage } from '@/hooks/useProTasks';
import type { Task } from '@/lib/types';

export default function ProTarefasPage() {
  const { data: tasks, isLoading } = useProTasks();
  const { data: patients } = usePatients();
  const del = useDeleteProTask();
  const toast = useToast();
  const [toDelete, setToDelete] = useState<Task | null>(null);

  // A API não faz eager load do paciente na tarefa, então mapeio id → nome
  // usando a lista de pacientes (mesmo consentimento, mesmos ids).
  const nameById = useMemo(() => {
    const map = new Map<number, string>();
    patients?.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [patients]);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      toast.success('Tarefa removida.');
      setToDelete(null);
    } catch (e) {
      toast.error(proTaskErrorMessage(e));
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Tarefas</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Tarefas que você atribuiu aos seus pacientes.
        </p>
      </header>

      <CreateTaskForm />

      <Card>
        <CardHeader
          title="Atribuídas"
          description="Uma tarefa some daqui se o paciente revogar o consentimento."
        />
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner label="Carregando tarefas" />
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <EmptyState
            title="Nenhuma tarefa atribuída"
            description="Crie a primeira usando o formulário acima."
          />
        ) : (
          <ul className="divide-y divide-line">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{t.title}</p>
                  <p className="text-xs text-ink-faint">
                    {nameById.get(t.patient_id) ?? 'Paciente'}
                    {' · '}
                    {t.status === 'done' ? 'Concluída' : 'Ativa'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setToDelete(t)}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-danger/5 hover:text-danger"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Excluir tarefa?"
        description={
          toDelete ? `"${toDelete.title}" será removida para o paciente.` : ''
        }
        confirmLabel="Excluir"
        confirmVariant="danger"
        loading={del.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}