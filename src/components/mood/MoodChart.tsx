'use client';

import { MOOD_META } from '@/lib/moodMeta';
import { localDayKey, weekdayShort, shortDayMonth } from '@/lib/date';
import type { Mood, MoodLevel } from '@/lib/types';

interface MoodChartProps {
  moods: Mood[];
  days?: 7 | 30;
}

interface DayPoint {
  key: string;
  label: string;
  level: MoodLevel | null;
}

/** Últimos `days` dias, do mais antigo (esq) ao hoje (dir). */
export function buildRange(moods: Mood[], days: 7 | 30): DayPoint[] {
  // Índice rápido: dia → humor (o mais recente do dia, se houver vários).
  const byDay = new Map<string, Mood>();
  for (const m of moods) {
    const key = localDayKey(m.recorded_at);
    const existing = byDay.get(key);
    if (!existing || new Date(m.recorded_at) > new Date(existing.recorded_at)) {
      byDay.set(key, m);
    }
  }

  const range: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDayKey(d);
    const mood = byDay.get(key);
    const index = days - 1 - i;
    // Com 30 dias só rotula a cada 5 dias + hoje — senão o eixo vira ilegível.
    const showLabel = days === 7 || index % 5 === 0 || i === 0;
    range.push({
      key,
      label: days === 7 ? weekdayShort(d) : showLabel ? shortDayMonth(d) : '',
      level: mood ? (mood.mood_level as MoodLevel) : null,
    });
  }
  return range;
}

// Geometria do SVG — mais largo com 30 dias pra não esmagar os pontos.
const H = 160;
const PAD_X = 24;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

function widthFor(days: 7 | 30): number {
  return days === 30 ? 640 : 320;
}

function xFor(index: number, days: 7 | 30): number {
  const plotW = widthFor(days) - PAD_X * 2;
  return PAD_X + (plotW / (days - 1)) * index;
}

/** Nível 1 embaixo, 5 em cima. */
function yFor(level: MoodLevel): number {
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  return PAD_TOP + plotH - ((level - 1) / 4) * plotH;
}

export function MoodChart({ moods, days = 7 }: MoodChartProps) {
  const W = widthFor(days);
  const range = buildRange(moods, days);
  const points = range
    .map((d, i) => (d.level ? { ...d, index: i, x: xFor(i, days), y: yFor(d.level) } : null))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const hasData = points.length > 0;

  // Só liga pontos de dias adjacentes: reta em cima de um dia sem registro é
  // dado inventado num gráfico que um profissional vai ler.
  const segments: string[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (curr.index - prev.index === 1) {
      segments.push(`M ${prev.x} ${prev.y} L ${curr.x} ${curr.y}`);
    }
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Gráfico do seu humor nos últimos ${days} dias`}
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
        {range.map(
          (d, i) =>
            d.label && (
              <text
                key={d.key}
                x={xFor(i, days)}
                y={H - 8}
                textAnchor="middle"
                className="fill-[var(--color-ink-faint)]"
                style={{ fontSize: 10 }}
              >
                {d.label}
              </text>
            ),
        )}
      </svg>

      {!hasData && (
        <p className="mt-2 text-center text-sm text-ink-faint">
          Registre seu humor para começar a ver seu histórico aqui.
        </p>
      )}
    </div>
  );
}
