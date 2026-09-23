import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { localDayKey } from '@/lib/date';
import type { Mood } from '@/lib/types';
import { MoodChart, buildRange, getDisplayedWindow } from './MoodChart';

/** `hour` separa dois registros do mesmo dia — e mantém o id único. */
function mood(daysAgo: number, level: Mood['mood_level'], hour = 12): Mood {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return {
    id: daysAgo * 100 + hour,
    user_id: 1,
    mood_level: level,
    thought: 'pensamento',
    behavior: 'comportamento',
    recorded_at: d.toISOString(),
    created_at: d.toISOString(),
    updated_at: d.toISOString(),
  };
}

function cxOf(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll('circle')).map((c) =>
    Number(c.getAttribute('cx')),
  );
}

function cyOf(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll('circle')).map((c) =>
    Number(c.getAttribute('cy')),
  );
}

/** Pontas do segmento: "M x1 y1 L x2 y2" → { x1, y1, x2, y2 }. */
function segmentEnds(path: Element) {
  const [x1, y1, x2, y2] = (path.getAttribute('d') ?? '')
    .replace(/[ML]/g, ' ')
    .trim()
    .split(/\s+/)
    .map(Number);
  return { x1, y1, x2, y2 };
}

describe('buildRange', () => {
  it('marca o dia sem registro como level null, mantendo os vizinhos', () => {
    // Registro no início da janela (6 dias atrás) evita que ela encurte —
    // aqui o alvo é o buraco no meio, não a janela adaptativa.
    const moods = [mood(6, 1), mood(3, 2), mood(1, 4)]; // 2 dias atrás (buraco) fica sem registro

    const range = buildRange(moods, 7);

    expect(range).toHaveLength(7);
    expect(range[3].level).toBe(2); // 3 dias atrás
    expect(range[5].level).toBe(4); // 1 dia atrás
    expect(range[4].level).toBeNull(); // 2 dias atrás — o buraco
    expect(range[4].key).toBe(localDayKey(new Date(new Date().setDate(new Date().getDate() - 2))));
  });
});

describe('buildRange — vários registros no mesmo dia', () => {
  it('guarda todos os registros do dia em ordem cronológica', () => {
    const moods = [mood(0, 5, 20), mood(0, 2, 8), mood(0, 4, 14)];

    const range = buildRange(moods, 7);
    const today = range[range.length - 1];

    expect(today.entries.map((e) => e.level)).toEqual([2, 4, 5]);
  });

  it('usa o registro mais recente do dia como level do dia', () => {
    const moods = [mood(0, 2, 8), mood(0, 5, 20)];

    const range = buildRange(moods, 7);

    expect(range[range.length - 1].level).toBe(5);
  });

  it('dia sem registro fica com entries vazio', () => {
    const moods = [mood(6, 3), mood(0, 4)];

    const range = buildRange(moods, 7);

    expect(range[3].entries).toEqual([]);
    expect(range[3].level).toBeNull();
  });
});

describe('MoodChart', () => {
  it('não desenha segmento atravessando um dia sem registro', () => {
    // 3 dias atrás e hoje têm humor; 2 e 1 dias atrás (entre eles) não têm.
    // Só o par (1 dia atrás, hoje) é adjacente e deve virar segmento.
    const moods = [mood(3, 2), mood(1, 4), mood(0, 5)];

    const { container } = render(<MoodChart moods={moods} days={7} />);

    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(1);

    // Os 3 pontos com registro aparecem, mesmo sem todos estarem ligados.
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(3);
  });

  it('liga normalmente dias consecutivos sem buraco', () => {
    const moods = [mood(1, 3), mood(0, 4)];

    const { container } = render(<MoodChart moods={moods} days={7} />);

    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('desenha um ponto por registro e não liga dois registros do mesmo dia', () => {
    // Registro 6 dias atrás fixa a janela em 7 colunas; hoje tem dois registros.
    // Os 5 dias no meio estão vazios e o par de hoje não se liga entre si.
    const moods = [mood(6, 3), mood(0, 2, 9), mood(0, 4, 19)];

    const { container } = render(<MoodChart moods={moods} days={7} />);

    expect(container.querySelectorAll('circle')).toHaveLength(3);
    expect(container.querySelectorAll('path')).toHaveLength(0);
  });

  it('liga um dia ao seguinte uma vez só, mesmo com vários registros nos dois', () => {
    const moods = [mood(1, 2, 9), mood(1, 5, 19), mood(0, 1, 8), mood(0, 4, 20)];

    const { container } = render(<MoodChart moods={moods} days={7} />);

    expect(container.querySelectorAll('circle')).toHaveLength(4);
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('o segmento entre dias sai do último registro do dia e chega no primeiro do seguinte', () => {
    // Ontem: nível 2 às 9h e nível 5 às 19h. Hoje: nível 1 às 8h e nível 4 às 20h.
    // A ligação tem que ser 5 → 1, não 2 → 1 nem 5 → 4.
    const moods = [mood(1, 2, 9), mood(1, 5, 19), mood(0, 1, 8), mood(0, 4, 20)];

    const { container } = render(<MoodChart moods={moods} days={7} />);
    const cys = cyOf(container);
    const ultimoDeOntem = cys[1];
    const primeiroDeHoje = cys[2];

    const { y1, y2 } = segmentEnds(container.querySelector('path')!);

    expect(y1).toBe(ultimoDeOntem);
    expect(y2).toBe(primeiroDeHoje);
  });

  it('registros do mesmo dia em níveis diferentes dividem a mesma posição no eixo X', () => {
    const moods = [mood(6, 3), mood(0, 2, 9), mood(0, 4, 19)];

    const { container } = render(<MoodChart moods={moods} days={7} />);
    const [, segundo, terceiro] = cxOf(container);

    expect(segundo).toBe(terceiro);
  });

  it('separa dois registros do mesmo dia no mesmo nível sem invadir a coluna vizinha', () => {
    const moods = [mood(6, 3), mood(0, 4, 9), mood(0, 4, 19)];

    const { container } = render(<MoodChart moods={moods} days={7} />);
    const [, primeiro, segundo] = cxOf(container);

    expect(primeiro).not.toBe(segundo);

    // A coluna de hoje é a última de 7. Os dois pontos ficam dentro da metade
    // da coluna, ou seja, antes da fronteira com a coluna vizinha.
    const columnGap = (320 - 24 * 2) / 6;
    const centro = 24 + columnGap * 6;
    for (const x of [primeiro, segundo]) {
      expect(Math.abs(x - centro)).toBeLessThan(columnGap / 2);
    }
  });

  it('não liga nada por cima de um dia vazio, nem dentro dos dias com registro', () => {
    // Dois registros 3 dias atrás, dois hoje; os dias do meio estão vazios.
    const moods = [mood(3, 2, 9), mood(3, 3, 18), mood(0, 4, 9), mood(0, 5, 18)];

    const { container } = render(<MoodChart moods={moods} days={7} />);

    expect(container.querySelectorAll('circle')).toHaveLength(4);
    expect(container.querySelectorAll('path')).toHaveLength(0);
  });

  it('renderiza os cinco rótulos de nível quando showLevelLabels está ligado', () => {
    const moods = [mood(0, 3)];

    const { container } = render(<MoodChart moods={moods} days={30} showLevelLabels />);

    expect(container.querySelectorAll('[data-level-label]')).toHaveLength(5);
  });

  it('não mostra rótulos de nível por padrão', () => {
    const moods = [mood(0, 3)];

    const { container } = render(<MoodChart moods={moods} days={30} />);

    expect(container.querySelectorAll('[data-level-label]')).toHaveLength(0);
  });
});

describe('buildRange — janela adaptativa', () => {
  it('encurta a janela quando o primeiro registro é mais recente que o início', () => {
    // Paciente novo: só há registro nos últimos 5 dias de uma janela de 30.
    const moods = [mood(4, 3), mood(2, 4), mood(0, 5)];

    const range = buildRange(moods, 30);

    expect(range).toHaveLength(5);
    expect(range[0].level).toBe(3); // dia do 1º registro vira o começo do eixo
    expect(range[range.length - 1].level).toBe(5);
  });

  it('não encurta quando já há registro no início da janela', () => {
    const moods = [mood(29, 2), mood(0, 5)];

    const range = buildRange(moods, 30);

    expect(range).toHaveLength(30);
  });

  it('sem nenhum registro, mantém a janela cheia (comportamento inalterado)', () => {
    const range = buildRange([], 30);

    expect(range).toHaveLength(30);
    expect(range.every((p) => p.level === null)).toBe(true);
  });
});

describe('getDisplayedWindow', () => {
  it('marca a janela como encurtada e começa no dia do primeiro registro', () => {
    const moods = [mood(4, 3), mood(0, 5)];

    const window = getDisplayedWindow(moods, 30);

    expect(window.shortened).toBe(true);
    const expectedStart = new Date();
    expectedStart.setDate(expectedStart.getDate() - 4);
    expect(localDayKey(window.start)).toBe(localDayKey(expectedStart));
  });

  it('não marca como encurtada quando há registro no início da janela', () => {
    const moods = [mood(29, 2), mood(0, 5)];

    expect(getDisplayedWindow(moods, 30).shortened).toBe(false);
  });

  it('não marca como encurtada sem nenhum registro', () => {
    expect(getDisplayedWindow([], 30).shortened).toBe(false);
  });
});
