import { describe, it, expect } from 'vitest';
import { groupByDayDesc } from './moodGroups';

/** Registro no fuso local, pra não depender de UTC virar o dia. */
function record(id: number, daysAgo: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return { id, recorded_at: d.toISOString() };
}

describe('groupByDayDesc', () => {
  it('agrupa vários registros do mesmo dia sob uma data só', () => {
    const groups = groupByDayDesc([record(1, 0, 9), record(2, 0, 20), record(3, 1, 10)]);

    expect(groups).toHaveLength(2);
    expect(groups[0].items.map((i) => i.id)).toEqual([2, 1]);
    expect(groups[1].items.map((i) => i.id)).toEqual([3]);
  });

  it('ordena os dias do mais recente para o mais antigo', () => {
    const groups = groupByDayDesc([record(1, 5, 12), record(2, 0, 12), record(3, 2, 12)]);

    expect(groups.map((g) => g.items[0].id)).toEqual([2, 3, 1]);
  });

  it('ordena dentro do dia do mais recente para o mais antigo, mesmo com a API fora de ordem', () => {
    const groups = groupByDayDesc([record(1, 0, 8), record(2, 0, 22), record(3, 0, 15)]);

    expect(groups[0].items.map((i) => i.id)).toEqual([2, 3, 1]);
  });

  it('desempata horário igual pelo id, sem variar entre chamadas', () => {
    const items = [record(1, 0, 10), record(2, 0, 10)];

    expect(groupByDayDesc(items)[0].items.map((i) => i.id)).toEqual([2, 1]);
    expect(groupByDayDesc([...items].reverse())[0].items.map((i) => i.id)).toEqual([2, 1]);
  });

  it('usa o registro mais recente do dia como data do grupo', () => {
    const maisRecente = record(2, 0, 20);
    const groups = groupByDayDesc([record(1, 0, 9), maisRecente]);

    expect(groups[0].date).toBe(maisRecente.recorded_at);
  });

  it('devolve lista vazia sem registros', () => {
    expect(groupByDayDesc([])).toEqual([]);
  });
});
