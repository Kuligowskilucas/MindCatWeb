'use client';

import Image from 'next/image';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { MOOD_META } from '@/lib/moodMeta';
import { timeOfDay } from '@/lib/date';
import type { Mood } from '@/lib/types';

interface TodayMoodListProps {
  /** Já ordenados do mais recente para o mais antigo (useTodayMoods). */
  moods: Mood[];
  isLoading?: boolean;
}

export function TodayMoodList({ moods, isLoading }: TodayMoodListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center py-10">
          <Spinner label="Carregando seus registros de hoje" />
        </CardBody>
      </Card>
    );
  }

  if (moods.length === 0) {
    return (
      <Card>
        <EmptyState
          emoji="🗒️"
          title="Nenhum registro hoje"
          description="Quando você registrar uma situação, ela aparece aqui."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="py-5">
        <h2 className="mb-4 text-base font-semibold text-ink">Seus registros de hoje</h2>

        <ul className="space-y-3">
          {moods.map((mood) => {
            const meta = MOOD_META[mood.mood_level];

            return (
              <li key={mood.id} className="rounded-card border border-line px-4 py-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={meta.image}
                    alt=""
                    width={36}
                    height={36}
                    style={{ width: 36, height: 'auto' }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{meta.label}</p>
                    <p className="text-xs text-ink-faint">
                      <time dateTime={mood.recorded_at}>{timeOfDay(mood.recorded_at)}</time>
                    </p>
                  </div>
                </div>

                {mood.feelings && mood.feelings.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mood.feelings.map((feeling) => (
                      <span
                        key={feeling.slug}
                        className="rounded-full border border-purple-400 bg-purple-400 px-3 py-1 text-xs font-medium text-white"
                      >
                        {feeling.label}
                      </span>
                    ))}
                  </div>
                )}

                <dl className="mt-3 space-y-2">
                  <div>
                    <dt className="text-xs font-medium text-ink-soft">Pensamento</dt>
                    <dd className="text-sm text-ink">{mood.thought}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-ink-soft">Comportamento</dt>
                    <dd className="text-sm text-ink">{mood.behavior}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
