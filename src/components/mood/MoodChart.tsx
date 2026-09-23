'use client';

import { MOOD_META, MOOD_LEVELS } from '@/lib/moodMeta';
import { localDayKey, weekdayShort, shortDayMonth } from '@/lib/date';
import type { Mood, MoodLevel } from '@/lib/types';

interface MoodChartProps {
  moods: Mood[];
  days?: 7 | 30;
  /** Rotula os cinco níveis no eixo Y. Só liga na tela do profissional. */
  showLevelLabels?: boolean;
}

/** Um registro de humor dentro do dia. */
export interface MoodEntry {
  id: number;
  level: MoodLevel;
  recordedAt: string;
}

export interface MoodPoint {
  key: string;
  label: string;
  /** Nível do registro mais recente do dia — null quando não há registro. */
  level: MoodLevel | null;
  /** Todos os registros do dia, em ordem cronológica. */
  entries: MoodEntry[];
}

interface DayEntry {
  date: Date;
  entries: MoodEntry[];
}

function groupMoodsByDay(moods: Mood[]): Map<string, MoodEntry[]> {
  // Vários registros por dia: o dia guarda a lista inteira, não só um humor.
  const byDay = new Map<string, MoodEntry[]>();
  for (const m of moods) {
    const key = localDayKey(m.recorded_at);
    const list = byDay.get(key) ?? [];
    list.push({ id: m.id, level: m.mood_level as MoodLevel, recordedAt: m.recorded_at });
    byDay.set(key, list);
  }
  for (const list of byDay.values()) {
    // Empate no horário cai no id pra ordem não variar entre renders.
    list.sort((a, b) => {
      const diff = new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime();
      return diff !== 0 ? diff : a.id - b.id;
    });
  }
  return byDay;
}

function buildDayEntries(moods: Mood[], days: number): DayEntry[] {
  const byDay = groupMoodsByDay(moods);
  const entries: DayEntry[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    entries.push({ date: d, entries: byDay.get(localDayKey(d)) ?? [] });
  }
  return entries;
}

/**
 * Corta o começo da janela até o primeiro dia com registro: paciente novo
 * não pode ler "estável" onde só falta histórico. Sem registro nenhum,
 * devolve a lista inteira — não há de onde cortar.
 */
function trimLeadingEmpty<T extends { entries: MoodEntry[] }>(items: T[]): T[] {
  const firstDataIndex = items.findIndex((item) => item.entries.length > 0);
  if (firstDataIndex <= 0) return items;
  return items.slice(firstDataIndex);
}

/** Últimos `days` dias, do mais antigo com registro (ou o 1º dia, se não houver nenhum) ao hoje. */
export function buildRange(moods: Mood[], days: 7 | 30): MoodPoint[] {
  const entries = trimLeadingEmpty(buildDayEntries(moods, days));
  const count = entries.length;
  return entries.map((entry, index) => {
    const i = count - 1 - index;
    // Com mais de uma semana só rotula a cada 5 dias + hoje — senão o eixo vira ilegível.
    const showLabel = days === 7 || index % 5 === 0 || i === 0;
    return {
      key: localDayKey(entry.date),
      label: days === 7 ? weekdayShort(entry.date) : showLabel ? shortDayMonth(entry.date) : '',
      level: entry.entries.length > 0 ? entry.entries[entry.entries.length - 1].level : null,
      entries: entry.entries,
    };
  });
}

export interface DisplayedWindow {
  start: Date;
  end: Date;
  /** true quando a janela foi encurtada por falta de registro no início. */
  shortened: boolean;
}

/** Período que o gráfico está de fato desenhando — pro subtítulo do card. */
export function getDisplayedWindow(moods: Mood[], days: 7 | 30): DisplayedWindow {
  const entries = buildDayEntries(moods, days);
  const end = entries[entries.length - 1].date; // a janela sempre termina hoje
  const trimmed = trimLeadingEmpty(entries);
  return { start: trimmed[0].date, end, shortened: trimmed.length < entries.length };
}

// Geometria do SVG — mais largo com janelas maiores pra não esmagar os pontos.
const H = 160;
const PAD_X = 24;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const LEVEL_LABEL_GUTTER = 80;
const WIDTH_BY_DAYS: Record<7 | 30, number> = { 7: 320, 30: 640 };
/** Altura útil: onde os cinco níveis vivem, entre os paddings. */
const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

function widthFor(days: 7 | 30): number {
  return WIDTH_BY_DAYS[days];
}

function xFor(index: number, count: number, leftPad: number, plotW: number): number {
  if (count <= 1) return leftPad;
  return leftPad + (plotW / (count - 1)) * index;
}

/** Nível 1 embaixo, 5 em cima. */
function yFor(level: number): number {
  return PAD_TOP + PLOT_H - ((level - 1) / 4) * PLOT_H;
}

const DAY_BAND_OPACITY = 0.4;

interface DayBand {
  key: string;
  x: number;
  width: number;
}

/**
 * Faixa de fundo dos dias em posição par. Com vários registros no mesmo dia não
 * se vê onde uma coluna termina e a outra começa; a faixa dá essa fronteira.
 * A largura é a da coluna, cortada na área útil — a primeira e a última ficam
 * com meia largura porque o centro delas é a própria borda do gráfico, e passar
 * disso invadiria o espaço dos rótulos de nível.
 */
function dayBands(range: MoodPoint[], leftPad: number, plotW: number): DayBand[] {
  const count = range.length;
  const plotRight = leftPad + plotW;
  const half = count > 1 ? plotW / (count - 1) / 2 : plotW;
  const bands: DayBand[] = [];

  range.forEach((day, index) => {
    if (index % 2 !== 0) return;

    const center = xFor(index, count, leftPad, plotW);
    const from = Math.max(leftPad, center - half);
    const to = Math.min(plotRight, center + half);

    bands.push({ key: day.key, x: from, width: to - from });
  });

  return bands;
}

// Dois registros do mesmo dia no mesmo nível cairiam no mesmo pixel: separa
// horizontalmente dentro da coluna do dia. DOT_STEP é o diâmetro do ponto + 1
// (encostam sem cobrir um ao outro) e COLUMN_SPREAD limita o espalhamento a
// 30% da coluna pra cada lado, então nunca invade a coluna vizinha.
const DOT_R = 5;
const DOT_STEP = DOT_R * 2 + 1;
const COLUMN_SPREAD = 0.6;

/**
 * Deslocamento em x de cada registro do dia, na mesma ordem da lista.
 * Quem não divide o nível com ninguém fica no centro da coluna (offset 0).
 */
function offsetsWithinDay(entries: MoodEntry[], columnGap: number): number[] {
  const offsets = entries.map(() => 0);
  const budget = columnGap * COLUMN_SPREAD;

  const indexesByLevel = new Map<MoodLevel, number[]>();
  entries.forEach((entry, index) => {
    const list = indexesByLevel.get(entry.level) ?? [];
    list.push(index);
    indexesByLevel.set(entry.level, list);
  });

  for (const indexes of indexesByLevel.values()) {
    if (indexes.length < 2) continue;
    const step = Math.min(DOT_STEP, budget / (indexes.length - 1));
    indexes.forEach((entryIndex, position) => {
      offsets[entryIndex] = (position - (indexes.length - 1) / 2) * step;
    });
  }

  return offsets;
}

interface PlottedPoint {
  id: number;
  /** Índice do dia no eixo X — é por ele que a linha decide se liga. */
  dayIndex: number;
  level: MoodLevel;
  x: number;
  y: number;
}

/** Um ponto por registro, em ordem cronológica; registros do mesmo dia dividem a coluna. */
function plotPoints(range: MoodPoint[], leftPad: number, plotW: number): PlottedPoint[] {
  const count = range.length;
  const columnGap = count > 1 ? plotW / (count - 1) : plotW;
  const plotted: PlottedPoint[] = [];

  range.forEach((day, dayIndex) => {
    const cx = xFor(dayIndex, count, leftPad, plotW);
    const offsets = offsetsWithinDay(day.entries, columnGap);

    day.entries.forEach((entry, index) => {
      plotted.push({
        id: entry.id,
        dayIndex,
        level: entry.level,
        x: cx + offsets[index],
        y: yFor(entry.level),
      });
    });
  });

  return plotted;
}

export function MoodChart({ moods, days = 7, showLevelLabels = false }: MoodChartProps) {
  const range = buildRange(moods, days);
  const count = range.length;

  // Rótulos de nível ganham espaço próprio no viewBox — não sobrepõem o gráfico.
  const leftPad = showLevelLabels ? PAD_X + LEVEL_LABEL_GUTTER : PAD_X;
  const W = widthFor(days) + (showLevelLabels ? LEVEL_LABEL_GUTTER : 0);
  const plotW = W - leftPad - PAD_X;

  const points = plotPoints(range, leftPad, plotW);
  const hasData = points.length > 0;

  // Liga só o último registro de um dia ao primeiro do dia seguinte. Dois
  // registros do mesmo dia dividem a coluna, então o segmento entre eles sairia
  // quase vertical e passaria impressão de queda brusca onde são dois momentos
  // do mesmo dia. Dia sem registro nenhum continua sem reta atravessando: dado
  // inventado num gráfico que um profissional vai ler.
  //
  // Os pontos estão em ordem cronológica, então a diferença de exatamente 1 dia
  // entre vizinhos da lista é sempre a virada de um dia para o seguinte.
  const segments: string[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (curr.dayIndex - prev.dayIndex === 1) {
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
        {/* Faixa alternada por dia, antes de tudo pra ficar atrás das
            linhas-guia, dos segmentos e dos pontos. */}
        {dayBands(range, leftPad, plotW).map((band) => (
          <rect
            key={band.key}
            data-day-band="true"
            x={band.x}
            y={PAD_TOP}
            width={band.width}
            height={PLOT_H}
            fill="var(--color-line)"
            opacity={DAY_BAND_OPACITY}
          />
        ))}

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
              dy={4}
              textAnchor="end"
              className="fill-[var(--color-ink-faint)]"
              style={{ fontSize: 12 }}
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
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={DOT_R}
            fill={MOOD_META[p.level].tint}
            stroke="var(--color-surface)"
            strokeWidth={2}
          />
        ))}

        {/* Rótulos do eixo X (dias) */}
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
