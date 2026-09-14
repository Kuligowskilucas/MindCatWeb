'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { MoodChart, getDisplayedWindow, type DisplayedWindow } from '@/components/mood/MoodChart';
import { usePatientSummary } from '@/hooks/usePatients';
import { ApiError } from '@/lib/http';
import { cn } from '@/lib/cn';
import { shortDayMonth } from '@/lib/date';
import { ChevronLeftIcon } from '@/components/icons';
import { MOOD_META } from '@/lib/moodMeta';
import type { MoodLevel, Mood } from '@/lib/types';

const RANGE_OPTIONS = [30, 90] as const;

export default function PacienteDetalhePage() {
  const params = useParams<{ id: string }>();
  const patientId = Number(params.id);
  const [days, setDays] = useState<30 | 90>(30);
  const { data, isLoading, error } = usePatientSummary(patientId, days);

  const chartMoods = data ? toChartMoods(data.moods, data.patient.id) : [];
  const displayedWindow =
    data && data.moods.length > 0 ? getDisplayedWindow(chartMoods, days) : null;

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
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-ink">{data.patient.name}</h1>
              <p className="mt-1 text-sm text-ink-soft">Resumo clínico</p>
            </div>

            <div
              role="group"
              aria-label="Período do resumo"
              className="flex gap-1 rounded-lg border border-line p-1"
            >
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={days === option}
                  onClick={() => setDays(option)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    days === option
                      ? 'bg-purple-400 text-white'
                      : 'text-ink-soft hover:bg-purple-50',
                  )}
                >
                  {option} dias
                </button>
              ))}
            </div>
          </header>

          <Card>
            <CardHeader
              title="Humor no período"
              description={humorSubtitle(days, data.range_days, displayedWindow)}
            />
            <CardBody>
              {data.moods.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-soft">
                  Sem registros de humor nesse período.
                </p>
              ) : (
                <MoodChart moods={chartMoods} days={days} showLevelLabels />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Sentimentos mais frequentes"
              description={`Nos últimos ${data.range_days} dias`}
            />
            <CardBody>
              {data.feelings_frequency.length === 0 ? (
                <p className="text-sm text-ink-soft">
                  Nenhum sentimento marcado nesse período.
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {data.feelings_frequency.map((f) => (
                    <li
                      key={f.slug}
                      className="flex items-center gap-1.5 rounded-full border border-purple-400 bg-purple-400 px-3.5 py-1.5 text-sm font-medium text-white"
                    >
                      <span>{f.label}</span>
                      <span className="text-xs font-semibold text-white/80">{f.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Registros recentes"
              description="Histórico do paciente nesse período (mais recentes primeiro)."
            />
            <CardBody>
              {data.moods.length === 0 ? (
                <p className="text-sm text-ink-soft">
                  Sem registros de humor nesse período.
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.moods.map((m) => {
                    const meta = MOOD_META[m.mood_level as MoodLevel];
                    return (
                      <li key={m.id} className="rounded-lg border border-line p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className="rounded-full px-2.5 py-1 text-xs font-medium text-ink"
                            // Tom suave do humor como fundo — mesma escala não-alarmante
                            // do app (nível 1 não é vermelho de erro, eufórico não é "bom").
                            style={{
                              backgroundColor: meta
                                ? `color-mix(in srgb, ${meta.tint} 18%, white)`
                                : undefined,
                            }}
                          >
                            {meta?.label ?? m.mood_level}
                          </span>
                          <span className="text-xs text-ink-faint">
                            {formatDay(m.recorded_at)}
                          </span>
                        </div>

                        {m.feelings && m.feelings.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {m.feelings.map((feeling) => (
                              <span
                                key={feeling.slug}
                                className="rounded-full border border-purple-400 bg-purple-400 px-3.5 py-1.5 text-sm font-medium text-white"
                              >
                                {feeling.label}
                              </span>
                            ))}
                          </div>
                        )}

                        {m.mood_description && (
                          <p className="mt-2 text-sm text-ink-soft">“{m.mood_description}”</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-xs text-ink-faint">Exercícios concluídos</p>
              <p className="mt-1 text-2xl font-semibold text-ink">
                {data.exercises_completed}
              </p>
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
 * Descreve o período que o gráfico está de fato mostrando — não o filtro
 * escolhido, mas a janela real, encurtada quando o paciente tem pouco
 * histórico (ver getDisplayedWindow em MoodChart).
 */
function humorSubtitle(
  days: 30 | 90,
  rangeDays: number,
  displayedWindow: DisplayedWindow | null,
): string {
  const base = displayedWindow?.shortened
    ? `De ${shortDayMonth(displayedWindow.start)} a ${shortDayMonth(displayedWindow.end)}`
    : `Últimos ${rangeDays} dias`;
  return days === 90 ? `${base} — média semanal` : base;
}

/** Adapta o SummaryMood (resumo do paciente) pro shape que o MoodChart espera. */
function toChartMoods(
  moods: { id: number; mood_level: number; mood_description: string | null; recorded_at: string }[],
  userId: number,
): Mood[] {
  return moods.map((m) => ({
    id: m.id,
    user_id: userId,
    mood_level: m.mood_level as MoodLevel,
    mood_description: m.mood_description,
    recorded_at: m.recorded_at,
    created_at: m.recorded_at,
    updated_at: m.recorded_at,
  }));
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
