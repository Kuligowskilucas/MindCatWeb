'use client';

import { MOOD_META, MOOD_LEVELS } from '@/lib/moodMeta';
import { localDayKey, weekdayShort, shortDayMonth } from '@/lib/date';
import type { Mood, MoodLevel } from '@/lib/types';

interface MoodChartProps {
  moods: Mood[];
  days?: 7 | 30 | 90;
  /** Rotula os cinco níveis no eixo Y. Só liga na tela do profissional. */
  showLevelLabels?: boolean;
}

export interface MoodPoint {
  key: string;
  label: string;
  /** Nível do dia, ou média semanal (fracionária) na janela de 90 dias. */
  level: number | null;
}

interface DayEntry {
  date: Date;
  level: MoodLevel | null;
}

function indexMoodsByDay(moods: Mood[]): Map<string, Mood> {
  // Índice rápido: dia → humor (o mais recente do dia, se houver vários).
  const byDay = new Map<string, Mood>();
  for (const m of moods) {
    const key = localDayKey(m.recorded_at);
    const existing = byDay.get(key);
    if (!existing || new Date(m.recorded_at) > new Date(existing.recorded_at)) {
      byDay.set(key, m);
    }
  }
  return byDay;
}

function buildDayEntries(moods: Mood[], days: number): DayEntry[] {
  const byDay = indexMoodsByDay(moods);
  const entries: DayEntry[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const mood = byDay.get(localDayKey(d));
    entries.push({ date: d, level: mood ? (mood.mood_level as MoodLevel) : null });
  }
  return entries;
}

/** Últimos `days` dias, do mais antigo (esq) ao hoje (dir). */
export function buildRange(moods: Mood[], days: 7 | 30 | 90): MoodPoint[] {
  const entries = buildDayEntries(moods, days);
  return entries.map((entry, index) => {
    const i = days - 1 - index;
    // Com mais de uma semana só rotula a cada N dias + hoje — senão o eixo vira ilegível.
    const labelStep = days === 90 ? 10 : 5;
    const showLabel = days === 7 || index % labelStep === 0 || i === 0;
    return {
      key: localDayKey(entry.date),
      label: days === 7 ? weekdayShort(entry.date) : showLabel ? shortDayMonth(entry.date) : '',
      level: entry.level,
    };
  });
}

const WEEK_SIZE = 7;

/**
 * 90 dias virando ~13 pontos: um por semana, com a média dos níveis
 * registrados nela. Semana sem nenhum registro fica com level null — mesma
 * regra de "sem dado, sem ponto" da visão diária, só que por semana.
 */
export function buildWeeklyRange(moods: Mood[], days = 90): MoodPoint[] {
  const entries = buildDayEntries(moods, days);
  const weeks: MoodPoint[] = [];
  for (let start = 0; start < entries.length; start += WEEK_SIZE) {
    const chunk = entries.slice(start, start + WEEK_SIZE);
    const levels = chunk
      .map((e) => e.level)
      .filter((l): l is MoodLevel => l !== null);
    const avg = levels.length > 0 ? levels.reduce((a, b) => a + b, 0) / levels.length : null;
    const weekStart = chunk[0].date;
    weeks.push({
      key: localDayKey(weekStart),
      label: shortDayMonth(weekStart),
      level: avg,
    });
  }
  return weeks;
}

// Geometria do SVG — mais largo com janelas maiores pra não esmagar os pontos.
const H = 160;
const PAD_X = 24;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const LEVEL_LABEL_GUTTER = 64;
const WIDTH_BY_DAYS: Record<7 | 30 | 90, number> = { 7: 320, 30: 640, 90: 960 };

function widthFor(days: 7 | 30 | 90): number {
  return WIDTH_BY_DAYS[days];
}

function xFor(index: number, count: number, leftPad: number, plotW: number): number {
  if (count <= 1) return leftPad;
  return leftPad + (plotW / (count - 1)) * index;
}

/** Nível 1 embaixo, 5 em cima. Aceita fração (média semanal). */
function yFor(level: number): number {
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  return PAD_TOP + plotH - ((level - 1) / 4) * plotH;
}

function clampLevel(level: number): MoodLevel {
  return Math.min(5, Math.max(1, Math.round(level))) as MoodLevel;
}

export function MoodChart({ moods, days = 7, showLevelLabels = false }: MoodChartProps) {
  const isWeekly = days === 90;
  const range = isWeekly ? buildWeeklyRange(moods, days) : buildRange(moods, days);
  const count = range.length;

  // Rótulos de nível ganham espaço próprio no viewBox — não sobrepõem o gráfico.
  const leftPad = showLevelLabels ? PAD_X + LEVEL_LABEL_GUTTER : PAD_X;
  const W = widthFor(days) + (showLevelLabels ? LEVEL_LABEL_GUTTER : 0);
  const plotW = W - leftPad - PAD_X;

  const points = range
    .map((d, i) => {
      const level = d.level;
      if (level === null) return null;
      return { ...d, level, index: i, x: xFor(i, count, leftPad, plotW), y: yFor(level) };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const hasData = points.length > 0;

  // Só liga pontos adjacentes (dias, ou semanas na janela de 90 dias): reta em
  // cima de um período sem registro é dado inventado num gráfico que um
  // profissional vai ler.
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
        aria-label={
          isWeekly
            ? `Gráfico do seu humor nos últimos ${days} dias, média semanal`
            : `Gráfico do seu humor nos últimos ${days} dias`
        }
      >
        {/* Linhas-guia horizontais (níveis 1 a 5) */}
        {MOOD_LEVELS.map((lvl) => (
          <line
            key={lvl}
            x1={leftPad}
            x2={W - PAD_X}
            y1={yFor(lvl)}
            y2={yFor(lvl)}
            stroke="var(--color-line)"
            strokeWidth={1}
            strokeDasharray={lvl === 3 ? '0' : '2 3'}
            opacity={lvl === 3 ? 0.8 : 0.5}
          />
        ))}

        {/* Rótulos dos níveis (eixo Y) — só na leitura clínica */}
        {showLevelLabels &&
          MOOD_LEVELS.map((lvl) => (
            <text
              key={`level-${lvl}`}
              data-level-label="true"
              x={leftPad - 8}
              y={yFor(lvl)}
              dy={3}
              textAnchor="end"
              className="fill-[var(--color-ink-faint)]"
              style={{ fontSize: 9 }}
            >
              {MOOD_META[lvl].label}
            </text>
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
            fill={MOOD_META[clampLevel(p.level)].tint}
            stroke="var(--color-surface)"
            strokeWidth={2}
          />
        ))}

        {/* Rótulos do eixo X (dias ou início de semana) */}
        {range.map(
          (d, i) =>
            d.label && (
              <text
                key={d.key}
                x={xFor(i, count, leftPad, plotW)}
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
