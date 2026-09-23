import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Mood } from '@/lib/types';
import { TodayMoodList } from './TodayMoodList';

function mood(overrides: Partial<Mood> = {}): Mood {
  const iso = new Date().toISOString();
  return {
    id: 1,
    user_id: 1,
    mood_level: 3,
    thought: 'pensamento',
    behavior: 'comportamento',
    recorded_at: iso,
    created_at: iso,
    updated_at: iso,
    ...overrides,
  };
}

/** Hoje às HH:mm, no fuso local — a lista mostra só o horário. */
function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

describe('TodayMoodList', () => {
  it('mostra estado vazio quando não há registro no dia', () => {
    render(<TodayMoodList moods={[]} />);

    expect(screen.getByText('Nenhum registro hoje')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('mostra os registros na ordem recebida, do mais recente para o mais antigo', () => {
    const moods = [
      mood({ id: 2, recorded_at: todayAt(18, 30), thought: 'pensamento da noite' }),
      mood({ id: 1, recorded_at: todayAt(9, 5), thought: 'pensamento da manhã' }),
    ];

    render(<TodayMoodList moods={moods} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('pensamento da noite');
    expect(items[0]).toHaveTextContent('18:30');
    expect(items[1]).toHaveTextContent('pensamento da manhã');
    expect(items[1]).toHaveTextContent('09:05');
  });

  it('mostra horário, humor, sentimentos, pensamento e comportamento', () => {
    const moods = [
      mood({
        id: 3,
        mood_level: 5,
        recorded_at: todayAt(14, 0),
        thought: 'Hoje eu mereço comemorar.',
        behavior: 'Saí com os amigos.',
        feelings: [
          { id: 1, slug: 'grato', label: 'Grato' },
          { id: 2, slug: 'animado', label: 'Animado' },
        ],
      }),
    ];

    render(<TodayMoodList moods={moods} />);

    const item = screen.getByRole('listitem');
    expect(item).toHaveTextContent('14:00');
    expect(item).toHaveTextContent('Muito feliz');
    expect(item).toHaveTextContent('Grato');
    expect(item).toHaveTextContent('Animado');
    expect(item).toHaveTextContent('Hoje eu mereço comemorar.');
    expect(item).toHaveTextContent('Saí com os amigos.');
  });

  it('mostra o carregando em vez da lista enquanto busca', () => {
    render(<TodayMoodList moods={[]} isLoading />);

    expect(screen.getByText('Carregando seus registros de hoje')).toBeInTheDocument();
    expect(screen.queryByText('Nenhum registro hoje')).not.toBeInTheDocument();
  });
});
