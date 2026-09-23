import { localDayKey } from './date';

export interface DayGroup<T> {
  /** YYYY-MM-DD no fuso local — chave estável de render. */
  key: string;
  /** ISO do registro mais recente do dia, pra formatar o cabeçalho. */
  date: string;
  items: T[];
}

interface Timestamped {
  id: number;
  recorded_at: string;
}

/**
 * Agrupa registros por dia (fuso local), do dia mais recente para o mais antigo,
 * e o mesmo dentro de cada dia. Não confia na ordem que a API mandou.
 */
export function groupByDayDesc<T extends Timestamped>(items: T[]): DayGroup<T>[] {
  const byDay = new Map<string, T[]>();

  for (const item of items) {
    const key = localDayKey(item.recorded_at);
    const list = byDay.get(key) ?? [];
    list.push(item);
    byDay.set(key, list);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, list]) => {
      // Empate no horário cai no id pra ordem não variar entre renders.
      const sorted = [...list].sort((a, b) => {
        const diff = new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime();
        return diff !== 0 ? diff : b.id - a.id;
      });
      return { key, date: sorted[0].recorded_at, items: sorted };
    });
}
