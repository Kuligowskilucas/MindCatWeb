'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { MoodChart } from './MoodChart';
import { useMoods } from '@/hooks/useMoods';
import { cn } from '@/lib/cn';

const RANGE_OPTIONS = [7, 30] as const;

export function MoodRangeCard() {
  const [days, setDays] = useState<7 | 30>(7);
  const { data: moods, isLoading, isError } = useMoods(days);

  return (
    <Card>
      <CardHeader
        title="Seu humor no período"
        description={`Os últimos ${days} dias`}
        action={
          <div
            role="group"
            aria-label="Período do gráfico"
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
        }
      />
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner label="Carregando gráfico" />
          </div>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-ink-soft">
            Não foi possível carregar seu histórico agora.
          </p>
        ) : (
          <MoodChart moods={moods ?? []} days={days} />
        )}
      </CardBody>
    </Card>
  );
}
