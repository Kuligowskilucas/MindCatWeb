'use client';

import { MoodChart } from '@/components/mood/MoodChart';
import { useHydrated } from './useHydrated';
import type { Mood, MoodLevel } from '@/lib/types';

interface MoodChartPreviewProps {
  /** Do dia mais antigo ao mais recente; null é dia sem registro. */
  levels: (MoodLevel | null)[];
  days: 7 | 30;
  showLevelLabels?: boolean;
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
  const hydrated = useHydrated();

  // Altura reservada pelo aspect-ratio pra que o desenho tardio não empurre o layout.
  return (
    <div className={showLevelLabels ? 'aspect-[9/2]' : 'aspect-[2/1]'}>
      {hydrated && (
        <MoodChart moods={buildMoods(levels)} days={days} showLevelLabels={showLevelLabels} />
      )}
    </div>
  );
}
