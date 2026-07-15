'use client';

import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useTasks, useMarkTaskDone, taskErrorMessage } from '@/hooks/useTasks';
import type { Task } from '@/lib/types';

/** Ex.: "12 de julho de 2026". */
function formatDone(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function TaskList() {
  const { data: tasks, isLoading, isError, error } = useTasks();
  const markDone = useMarkTaskDone();
  const toast = useToast();

  async function handleDone(task: Task) {
    try {
      await markDone.mutateAsync(task.id);
      toast.success('Tarefa concluída. Bom trabalho.');
    } catch (err) {
      toast.error(taskErrorMessage(err));
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center py-10">
          <Spinner label="Carregando suas tarefas" />
        </CardBody>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-8 text-center text-sm text-danger">
          {taskErrorMessage(error)}
        </CardBody>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhuma tarefa por enquanto"
          description="Quando seu psicólogo criar tarefas terapêuticas para você, elas aparecem aqui."
        />
      </Card>
    );
  }

  const pending = tasks.filter((t) => t.status === 'active');
  const done = tasks.filter((t) => t.status === 'done');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="A fazer"
          description={
            pending.length
              ? `${pending.length} pendente${pending.length > 1 ? 's' : ''}`
              : 'Tudo em dia'
          }
        />
        <CardBody className="space-y-3">
          {pending.length === 0 ? (
            <p className="py-2 text-sm text-ink-soft">
              Você concluiu todas as tarefas.
            </p>
          ) : (
            pending.map((task) => {
              // markDone.variables guarda o id da última mutação em voo:
              // usamos pra pôr o spinner só no botão da tarefa clicada.
              const marking = markDone.isPending && markDone.variables === task.id;
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-4 py-3"
                >
                  <span className="min-w-0 text-sm text-ink">{task.title}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    loading={marking}
                    // Desabilita as outras enquanto uma está em voo.
                    disabled={markDone.isPending && !marking}
                    onClick={() => handleDone(task)}
                  >
                    Marcar como feita
                  </Button>
                </div>
              );
            })
          )}
        </CardBody>
      </Card>

      {done.length > 0 && (
        <Card>
          <CardHeader title="Concluídas" description={`${done.length} no total`} />
          <CardBody className="space-y-3">
            {done.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-line px-4 py-3"
              >
                <span className="min-w-0 text-sm text-ink-soft line-through">
                  {task.title}
                </span>
                {task.completed_at && (
                  <span className="shrink-0 text-xs text-ink-faint">
                    {formatDone(task.completed_at)}
                  </span>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}