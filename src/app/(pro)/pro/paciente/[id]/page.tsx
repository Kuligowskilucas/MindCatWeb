'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePatientSummary } from '@/hooks/usePatients';
import { ApiError } from '@/lib/http';
import { ChevronLeftIcon } from '@/components/icons';
import { MOOD_META } from '@/lib/moodMeta';
import type { MoodLevel } from '@/lib/types';

export default function PacienteDetalhePage() {
  const params = useParams<{ id: string }>();
  const patientId = Number(params.id);
  const { data, isLoading, error } = usePatientSummary(patientId);

  return (
    <div className="space-y-6">
      <Link
        href="/pro"
        className="inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-purple-600"
      >
        <ChevronLeftIcon aria-hidden className="h-4 w-4" />
        Pacientes
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-14">
          <Spinner size="lg" label="Carregando resumo" />
        </div>
      ) : error ? (
        <SummaryError error={error} />
      ) : data ? (
        <>
          <header>
            <h1 className="text-2xl font-semibold text-ink">{data.patient.name}</h1>
            <p className="mt-1 text-sm text-ink-soft">Resumo clínico</p>
          </header>

          <Card>
            <CardBody>
              <p className="text-xs text-ink-faint">Exercícios concluídos</p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                {data.exercises_completed}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Humor recente"
              description="Últimos registros do paciente (mais recentes primeiro)."
            />
            <CardBody>
              {data.moods.length === 0 ? (
                <p className="text-sm text-ink-soft">Nenhum registro de humor ainda.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {data.moods.map((m) => {
                    const meta = MOOD_META[m.mood_level as MoodLevel];
                    return (
                      <li
                        key={m.id}
                        title={meta?.label}
                        className="flex min-w-[64px] flex-col items-center gap-0.5 rounded-lg border border-line px-3 py-2"
                        // Tom suave do humor como fundo — mesma escala não-alarmante
                        // do app (nível 1 não é vermelho de erro).
                        style={{
                          backgroundColor: meta
                            ? `color-mix(in srgb, ${meta.tint} 14%, white)`
                            : undefined,
                        }}
                      >
                        <span className="text-xs font-medium text-ink">
                          {meta?.label ?? m.mood_level}
                        </span>
                        <span className="text-[10px] text-ink-faint">
                          {formatDay(m.recorded_at)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Diário"
              description="Você vê quando o paciente escreveu — nunca o conteúdo."
            />
            <CardBody>
              {data.diary.length === 0 ? (
                <p className="text-sm text-ink-soft">Nenhuma entrada.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.diary.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-ink-soft">Entrada registrada</span>
                      <span className="text-ink-faint">{formatDate(d.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <div className="flex justify-end">
            <Link href="/pro/tarefas">
              <Button variant="secondary">Criar tarefa</Button>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * O 403 aqui é esperado e específico: o Gate view-patient exige consentimento
 * ativo, então um paciente que revogou depois de vinculado cai aqui. Não é erro
 * de rede — é uma situação de produto que merece cópia própria.
 */
function SummaryError({ error }: { error: unknown }) {
  const status = error instanceof ApiError ? error.status : undefined;

  if (status === 403) {
    return (
      <Card>
        <EmptyState
          title="Paciente não liberou os dados"
          description="Este paciente revogou o consentimento de compartilhamento. Você continua vinculado, mas o resumo fica indisponível até ele reativar no app."
          action={
            <Link href="/pro">
              <Button variant="secondary">Voltar</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  if (status === 404) {
    return (
      <Card>
        <EmptyState
          title="Paciente não encontrado"
          description="O paciente pode ter sido removido."
          action={
            <Link href="/pro">
              <Button variant="secondary">Voltar</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <EmptyState
        title="Não foi possível carregar"
        description="Tente novamente em instantes."
        action={
          <Link href="/pro">
            <Button variant="secondary">Voltar</Button>
          </Link>
        }
      />
    </Card>
  );
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}