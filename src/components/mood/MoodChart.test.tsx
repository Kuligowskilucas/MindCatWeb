import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { localDayKey } from '@/lib/date';
import type { Mood } from '@/lib/types';
import { MoodChart, buildRange, getDisplayedWindow } from './MoodChart';

function mood(daysAgo: number, level: Mood['mood_level']): Mood {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: daysAgo,
    user_id: 1,
    mood_level: level,
    thought: 'pensamento',
    behavior: 'comportamento',
    recorded_at: d.toISOString(),
    created_at: d.toISOString(),
    updated_at: d.toISOString(),
  };
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
