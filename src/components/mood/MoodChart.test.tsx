import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { localDayKey } from '@/lib/date';
import type { Mood } from '@/lib/types';
import { MoodChart, buildRange } from './MoodChart';

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
});
