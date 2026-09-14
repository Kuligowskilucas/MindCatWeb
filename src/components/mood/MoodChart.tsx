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
  /** Nível do dia — null quando não há registro naquele dia. */
  level: MoodLevel | null;
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

/**
 * Corta o começo da janela até o primeiro item com registro: paciente novo
 * não pode ler "estável" onde só falta histórico. Sem registro nenhum,
 * devolve a lista inteira — não há de onde cortar.
 */
function trimLeadingEmpty<T>(items: T[], hasData: (item: T) => boolean): T[] {
  const firstDataIndex = items.findIndex(hasData);
  if (firstDataIndex <= 0) return items;
  return items.slice(firstDataIndex);
}

/** Últimos `days` dias, do mais antigo com registro (ou o 1º dia, se não houver nenhum) ao hoje. */
export function buildRange(moods: Mood[], days: 7 | 30 | 90): MoodPoint[] {
  const entries = trimLeadingEmpty(buildDayEntries(moods, days), (e) => e.level !== null);
  const count = entries.length;
  return entries.map((entry, index) => {
    const i = count - 1 - index;
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

interface WeekEntry {
  weekStart: Date;
  /** Níveis registrados na semana, em ordem crescente. */
  levels: MoodLevel[];
}

function buildWeekEntries(moods: Mood[], days: number): WeekEntry[] {
  const entries = buildDayEntries(moods, days);
  const weeks: WeekEntry[] = [];
  for (let start = 0; start < entries.length; start += WEEK_SIZE) {
    const chunk = entries.slice(start, start + WEEK_SIZE);
    const levels = chunk
      .map((e) => e.level)
      .filter((l): l is MoodLevel => l !== null)
      .sort((a, b) => a - b);
    weeks.push({ weekStart: chunk[0].date, levels });
  }
  return weeks;
}

function medianOf(sortedLevels: MoodLevel[]): number {
  const mid = Math.floor(sortedLevels.length / 2);
  return sortedLevels.length % 2 === 0
    ? (sortedLevels[mid - 1] + sortedLevels[mid]) / 2
    : sortedLevels[mid];
}

export interface WeeklyMoodPoint {
  key: string;
  label: string;
  /** Menor, maior e mediana dos níveis da semana — null quando não há registro. */
  min: number | null;
  max: number | null;
  median: number | null;
}

/**
 * 90 dias virando ~13 pontos semanais. A média apaga oscilação (Bravo e
 * Muito feliz na mesma semana viravam um ponto em Normal) — em vez dela,
 * cada semana carrega a faixa min–max registrada, com a mediana marcando o
 * ponto que a linha liga entre semanas adjacentes. Semana sem nenhum
 * registro fica com tudo null — mesma regra de "sem dado, sem ponto" da
 * visão diária, só que por semana. Semanas sem registro no começo da janela
 * são cortadas (ver trimLeadingEmpty).
 */
export function buildWeeklyRange(moods: Mood[], days = 90): WeeklyMoodPoint[] {
  const weeks = trimLeadingEmpty(buildWeekEntries(moods, days), (w) => w.levels.length > 0);
  return weeks.map((w) => ({
    key: localDayKey(w.weekStart),
    label: shortDayMonth(w.weekStart),
    min: w.levels.length > 0 ? w.levels[0] : null,
    max: w.levels.length > 0 ? w.levels[w.levels.length - 1] : null,
    median: w.levels.length > 0 ? medianOf(w.levels) : null,
  }));
}

export interface DisplayedWindow {
  start: Date;
  end: Date;
  /** true quando a janela foi encurtada por falta de registro no início. */
  shortened: boolean;
}

/** Período (dias ou semanas) que o gráfico está de fato desenhando — pro subtítulo do card. */
export function getDisplayedWindow(moods: Mood[], days: 7 | 30 | 90): DisplayedWindow {
  const entries = buildDayEntries(moods, days);
  const end = entries[entries.length - 1].date; // a janela sempre termina hoje

  if (days === 90) {
    const weeks = buildWeekEntries(moods, days);
    const trimmed = trimLeadingEmpty(weeks, (w) => w.levels.length > 0);
    return { start: trimmed[0].weekStart, end, shortened: trimmed.length < weeks.length };
  }

  const trimmed = trimLeadingEmpty(entries, (e) => e.level !== null);
  return { start: trimmed[0].date, end, shortened: trimmed.length < entries.length };
}

// Geometria do SVG — mais largo com janelas maiores pra não esmagar os pontos.
const H = 160;
const PAD_X = 24;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const LEVEL_LABEL_GUTTER = 72;
const WIDTH_BY_DAYS: Record<7 | 30 | 90, number> = { 7: 320, 30: 640, 90: 960 };

function widthFor(days: 7 | 30 | 90): number {
  return WIDTH_BY_DAYS[days];
}

function xFor(index: number, count: number, leftPad: number, plotW: number): number {
  if (count <= 1) return leftPad;
  return leftPad + (plotW / (count - 1)) * index;
}

/** Nível 1 embaixo, 5 em cima. Aceita fração (mediana semanal). */
function yFor(level: number): number {
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  return PAD_TOP + plotH - ((level - 1) / 4) * plotH;
}

function clampLevel(level: number): MoodLevel {
  return Math.min(5, Math.max(1, Math.round(level))) as MoodLevel;
}

export function MoodChart({ moods, days = 7, showLevelLabels = false }: MoodChartProps) {
  const isWeekly = days === 90;
  const dailyRange = isWeekly ? [] : buildRange(moods, days);
  const weeklyRange = isWeekly ? buildWeeklyRange(moods, days) : [];
  const range: { key: string; label: string }[] = isWeekly ? weeklyRange : dailyRange;
  const count = range.length;

  // Rótulos de nível ganham espaço próprio no viewBox — não sobrepõem o gráfico.
  const leftPad = showLevelLabels ? PAD_X + LEVEL_LABEL_GUTTER : PAD_X;
  const W = widthFor(days) + (showLevelLabels ? LEVEL_LABEL_GUTTER : 0);
  const plotW = W - leftPad - PAD_X;

  const dayPoints = dailyRange
    .map((d, i) => {
      const level = d.level;
      if (level === null) return null;
      return { ...d, level, index: i, x: xFor(i, count, leftPad, plotW), y: yFor(level) };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // Cada semana vira uma faixa do nível mínimo ao máximo registrado, com a
  // mediana marcando o ponto — a média apaga oscilação (Bravo e Muito feliz
  // na mesma semana não podem virar um ponto só em Normal).
  const weekMarks = weeklyRange
    .map((w, i) => {
      if (w.median === null || w.min === null || w.max === null) return null;
      return {
        key: w.key,
        index: i,
        x: xFor(i, count, leftPad, plotW),
        medianY: yFor(w.median),
        minY: yFor(w.min),
        maxY: yFor(w.max),
        median: w.median,
        // Um único registro (ou vários iguais) não tem faixa pra desenhar.
        hasBand: w.min !== w.max,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const hasData = isWeekly ? weekMarks.length > 0 : dayPoints.length > 0;

  // Só liga pontos/medianas adjacentes (dias, ou semanas na janela de 90
  // dias): reta em cima de um período sem registro é dado inventado num
  // gráfico que um profissional vai ler.
  const daySegments: string[] = [];
  for (let i = 1; i < dayPoints.length; i++) {
    const prev = dayPoints[i - 1];
    const curr = dayPoints[i];
    if (curr.index - prev.index === 1) {
      daySegments.push(`M ${prev.x} ${prev.y} L ${curr.x} ${curr.y}`);
    }
  }

  const weekSegments: string[] = [];
  for (let i = 1; i < weekMarks.length; i++) {
    const prev = weekMarks[i - 1];
    const curr = weekMarks[i];
    if (curr.index - prev.index === 1) {
      weekSegments.push(`M ${prev.x} ${prev.medianY} L ${curr.x} ${curr.medianY}`);
    }
  }

  const segments = isWeekly ? weekSegments : daySegments;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={
          isWeekly
            ? `Gráfico do seu humor nos últimos ${days} dias, variação semanal`
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
              style={{ fontSize: 10 }}
            >
              {MOOD_META[lvl].label}
            </text>
          ))}

        {/* Linha do humor — liga o nível do dia, ou a mediana da semana */}
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

        {isWeekly
          ? /* Faixa min–max da semana (quando há mais de um valor) + mediana */
            weekMarks.map((w) => (
              <g key={w.key}>
                {w.hasBand && (
                  <line
                    data-week-band="true"
                    x1={w.x}
                    x2={w.x}
                    y1={w.minY}
                    y2={w.maxY}
                    stroke={MOOD_META[clampLevel(w.median)].tint}
                    strokeWidth={5}
                    strokeLinecap="round"
                    opacity={0.35}
                  />
                )}
                <circle
                  cx={w.x}
                  cy={w.medianY}
                  r={5}
                  fill={MOOD_META[clampLevel(w.median)].tint}
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                />
              </g>
            ))
          : /* Pontos */
            dayPoints.map((p) => (
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
