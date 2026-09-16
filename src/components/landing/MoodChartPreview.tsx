'use client';

import { useSyncExternalStore } from 'react';
import { MoodChart } from '@/components/mood/MoodChart';
import type { Mood, MoodLevel } from '@/lib/types';

interface MoodChartPreviewProps {
  /** Do dia mais antigo ao mais recente; null é dia sem registro. */
  levels: (MoodLevel | null)[];
  days: 7 | 30;
  showLevelLabels?: boolean;
}

/** Nunca emite mudança: o valor só troca do snapshot do servidor pro do cliente. */
function subscribeNever(): () => void {
  return () => {};
}

function buildMoods(levels: (MoodLevel | null)[]): Mood[] {
  const moods: Mood[] = [];

  levels.forEach((level, index) => {
    if (level === null) return;

    const date = new Date();
    date.setDate(date.getDate() - (levels.length - 1 - index));
    const iso = date.toISOString();

    moods.push({
      id: index + 1,
      user_id: 0,
      mood_level: level,
      mood_description: null,
      recorded_at: iso,
      created_at: iso,
      updated_at: iso,
    });
  });

  return moods;
}

export function MoodChartPreview({ levels, days, showLevelLabels }: MoodChartPreviewProps) {
  // O MoodChart monta a janela a partir de new Date(). A landing é
  // prerenderizada no build, então o HTML estático traria as datas do build e
  // o cliente, as de hoje: hidratação divergente garantida. Desenha só no
  // cliente, com a altura reservada pra não empurrar o layout.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  return (
    <div className={showLevelLabels ? 'aspect-[9/2]' : 'aspect-[2/1]'}>
      {mounted && (
        <MoodChart moods={buildMoods(levels)} days={days} showLevelLabels={showLevelLabels} />
      )}
    </div>
  );
}
