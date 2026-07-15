'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { MoodChart } from './MoodChart';
import { useMoods } from '@/hooks/useMoods';

export function MoodWeekCard() {
  const { data: moods, isLoading, isError } = useMoods();

  return (
    <Card>
      <CardHeader
        title="Seu humor na semana"
        description="Os últimos 7 dias"
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
          <MoodChart moods={moods ?? []} />
        )}
      </CardBody>
    </Card>
  );
}