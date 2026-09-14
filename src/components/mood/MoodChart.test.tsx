import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { localDayKey } from '@/lib/date';
import type { Mood } from '@/lib/types';
import { MoodChart, buildRange, buildWeeklyRange } from './MoodChart';

function mood(daysAgo: number, level: Mood['mood_level']): Mood {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: daysAgo,
    user_id: 1,
    mood_level: level,
    mood_description: null,
    recorded_at: d.toISOString(),
    created_at: d.toISOString(),
    updated_at: d.toISOString(),
  };
}

describe('buildRange', () => {
  it('marca o dia sem registro como level null, mantendo os vizinhos', () => {
    const moods = [mood(3, 2), mood(1, 4)]; // 2 dias atrás (buraco) fica sem registro

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

describe('buildWeeklyRange', () => {
  it('agrega 90 dias em ~13 semanas, semana sem registro fica com level null', () => {
    // Só os extremos têm registro: semana mais antiga e semana mais recente.
    const moods = [mood(89, 2), mood(0, 5)];

    const weeks = buildWeeklyRange(moods);

    expect(weeks).toHaveLength(13);
    expect(weeks[0].level).toBe(2);
    expect(weeks[weeks.length - 1].level).toBe(5);
    expect(weeks[6].level).toBeNull(); // semana no meio, sem nenhum registro
  });

  it('faz a média dos níveis registrados na semana', () => {
    // dias 2 e 3 atrás caem na mesma semana (a mais recente).
    const moods = [mood(2, 4), mood(3, 2)];

    const weeks = buildWeeklyRange(moods);

    expect(weeks[weeks.length - 1].level).toBe(3); // média de 4 e 2
  });
});

describe('MoodChart com days=90 (janela semanal)', () => {
  it('semana vazia no meio não gera segmento atravessando', () => {
    // Semana 0 (mais antiga) e semana 1 são adjacentes; a semana com o
    // registro de 60 dias atrás fica isolada, com semanas vazias antes dela.
    const moods = [mood(89, 2), mood(82, 3), mood(60, 4)];

    const { container } = render(<MoodChart moods={moods} days={90} />);

    expect(container.querySelectorAll('path')).toHaveLength(1);
    expect(container.querySelectorAll('circle')).toHaveLength(3);
  });
});
