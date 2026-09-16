'use client';

import { useState } from 'react';
import { MoodScale } from '@/components/mood/MoodScale';
import { MOOD_META } from '@/lib/moodMeta';
import type { MoodLevel } from '@/lib/types';

function panelBackground(level: MoodLevel | null): string {
  if (!level) return 'var(--color-purple-50)';
  return `color-mix(in srgb, var(--color-mood-${level}) 14%, var(--color-canvas))`;
}

function panelBorder(level: MoodLevel | null): string {
  if (!level) return 'var(--color-line)';
  return `color-mix(in srgb, var(--color-mood-${level}) 45%, var(--color-canvas))`;
}

export function MoodDemo() {
  const [level, setLevel] = useState<MoodLevel | null>(null);
  const meta = level ? MOOD_META[level] : null;

  return (
    <div
      className="rounded-card border p-5 transition-colors duration-500 motion-reduce:transition-none sm:p-8"
      style={{ backgroundColor: panelBackground(level), borderColor: panelBorder(level) }}
    >
      <div className="rounded-card border border-line bg-surface px-4 py-6 sm:px-6">
        <p className="mb-5 text-center text-base font-semibold text-ink">
          Como você está se sentindo hoje?
        </p>
        <MoodScale value={level} onChange={setLevel} />
      </div>

      <p
        aria-live="polite"
        className="mx-auto mt-5 max-w-lg text-center text-base leading-relaxed text-ink-soft"
      >
        {meta ? (
          <>
            <span className="font-medium text-ink">
              Hoje você está: {meta.label.toLowerCase()}.
            </span>{' '}
            Isso é só uma demonstração, nada é salvo. No app, esse toque entra no seu
            histórico.
          </>
        ) : (
          'Toque em um gato para ver como fica o registro do dia.'
        )}
      </p>
    </div>
  );
}
