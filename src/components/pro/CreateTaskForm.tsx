'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { usePatients } from '@/hooks/usePatients';
import { useCreateProTask, proTaskErrorMessage } from '@/hooks/useProTasks';

const MAX_TITLE = 120;

export function CreateTaskForm() {
  const { data: patients } = usePatients();
  const create = useCreateProTask();
  const toast = useToast();

  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string>();

  const hasPatients = (patients?.length ?? 0) > 0;

  async function submit() {
    if (!patientId) {
      setError('Selecione um paciente.');
      return;
    }
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Escreva o título da tarefa.');
      return;
    }
    if (trimmed.length > MAX_TITLE) {
      setError(`Máximo de ${MAX_TITLE} caracteres.`);
      return;
    }
    setError(undefined);

    try {
      await create.mutateAsync({ patientId: Number(patientId), title: trimmed });
      toast.success('Tarefa criada.');
      setTitle('');
    } catch (e) {
      toast.error(proTaskErrorMessage(e));
    }
  }

  return (
    <Card>
      <CardHeader
        title="Nova tarefa"
        description="Atribua uma tarefa terapêutica a um paciente."
      />
      <CardBody className="space-y-4">
        <div className="w-full">
          <label
            htmlFor="task-patient"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Paciente
          </label>
          {/* Não existe componente Select no design system ainda; uso um select
              nativo estilizado com os mesmos tokens do Input. */}
          <select
            id="task-patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={!hasPatients || create.isPending}
            className="h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink transition-colors hover:border-purple-200 disabled:bg-purple-50 disabled:text-ink-faint"
          >
            <option value="">
              {hasPatients ? 'Selecione…' : 'Nenhum paciente vinculado'}
            </option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE}
          hint={`${title.length}/${MAX_TITLE}`}
          disabled={!hasPatients || create.isPending}
          placeholder="Ex.: Registrar o humor todos os dias esta semana"
        />

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button onClick={submit} loading={create.isPending} disabled={!hasPatients}>
            Criar tarefa
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}