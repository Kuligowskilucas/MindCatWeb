'use client';

import { MOOD_META } from '@/lib/moodMeta';
import { localDayKey, weekdayShort } from '@/lib/date';
import type { Mood, MoodLevel } from '@/lib/types';

interface MoodChartProps {
  moods: Mood[];
}

interface DayPoint {
  key: string;
  label: string;
  level: MoodLevel | null;
}

/** Últimos 7 dias, do mais antigo (esq) ao hoje (dir). */
function buildWeek(moods: Mood[]): DayPoint[] {
  // Índice rápido: dia → humor (o mais recente do dia, se houver vários).
  const byDay = new Map<string, Mood>();
  for (const m of moods) {
    const key = localDayKey(m.recorded_at);
    const existing = byDay.get(key);
    if (!existing || new Date(m.recorded_at) > new Date(existing.recorded_at)) {
      byDay.set(key, m);
    }
  }

  const days: DayPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDayKey(d);
    const mood = byDay.get(key);
    days.push({
      key,
      label: weekdayShort(d),
      level: mood ? (mood.mood_level as MoodLevel) : null,
    });
  }
  return days;
}

// Geometria do SVG
const W = 320;
const H = 160;
const PAD_X = 24;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const PLOT_W = W - PAD_X * 2;
const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

function xFor(index: number): number {
  return PAD_X + (PLOT_W / 6) * index;
}

/** Nível 1 embaixo, 5 em cima. */
function yFor(level: MoodLevel): number {
  return PAD_TOP + PLOT_H - ((level - 1) / 4) * PLOT_H;
}

export function MoodChart({ moods }: MoodChartProps) {
  const week = buildWeek(moods);
  const points = week
    .map((d, i) => (d.level ? { ...d, x: xFor(i), y: yFor(d.level) } : null))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const hasData = points.length > 0;

  // Linha ligando apenas dias consecutivos com registro.
  const segments: string[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    segments.push(`M ${prev.x} ${prev.y} L ${curr.x} ${curr.y}`);
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Gráfico do seu humor nos últimos 7 dias"
      >
        {/* Linhas-guia horizontais (níveis 1 a 5) */}
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((lvl) => (
          <line
            key={lvl}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={yFor(lvl)}
            y2={yFor(lvl)}
            stroke="var(--color-line)"
            strokeWidth={1}
            strokeDasharray={lvl === 3 ? '0' : '2 3'}
            opacity={lvl === 3 ? 0.8 : 0.5}
          />
        ))}

        {/* Linha do humor */}
        {segments.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="var(--color-purple-300)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}

        {/* Pontos */}
        {points.map((p) => (
          <circle
            key={p.key}
            cx={p.x}
            cy={p.y}
            r={5}
            fill={MOOD_META[p.level!].tint}
            stroke="var(--color-surface)"
            strokeWidth={2}
          />
        ))}

        {/* Rótulos dos dias */}
        {week.map((d, i) => (
          <text
            key={d.key}
            x={xFor(i)}
            y={H - 8}
            textAnchor="middle"
            className="fill-[var(--color-ink-faint)]"
            style={{ fontSize: 10 }}
          >
            {d.label}
          </text>
        ))}
      </svg>

      {!hasData && (
        <p className="mt-2 text-center text-sm text-ink-faint">
          Registre seu humor para começar a ver seu histórico aqui.
        </p>
      )}
    </div>
  );
}