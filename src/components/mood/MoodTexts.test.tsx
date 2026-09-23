import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MoodTexts } from './MoodTexts';

describe('MoodTexts', () => {
  it('mostra os dois textos com rótulo', () => {
    render(<MoodTexts thought="Achei que ia dar errado." behavior="Fui até o fim." />);

    expect(screen.getByText('Pensamento')).toBeInTheDocument();
    expect(screen.getByText('Achei que ia dar errado.')).toBeInTheDocument();
    expect(screen.getByText('Comportamento')).toBeInTheDocument();
    expect(screen.getByText('Fui até o fim.')).toBeInTheDocument();
  });

  it('mantém os rótulos e marca o vazio quando o registro é anterior à migration', () => {
    render(<MoodTexts thought={null} behavior={null} />);

    expect(screen.getByText('Pensamento')).toBeInTheDocument();
    expect(screen.getByText('Comportamento')).toBeInTheDocument();
    expect(screen.getAllByText('Não informado')).toHaveLength(2);
  });

  it('trata texto só com espaço como vazio', () => {
    render(<MoodTexts thought="   " behavior="Saí pra caminhar." />);

    expect(screen.getByText('Não informado')).toBeInTheDocument();
    expect(screen.getByText('Saí pra caminhar.')).toBeInTheDocument();
  });
});
