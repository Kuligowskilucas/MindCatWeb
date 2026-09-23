import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from './page';

// next/font depende do compilador do Next; no vitest só o className importa.
vi.mock('next/font/google', () => ({
  Fraunces: () => ({ className: 'font-fraunces' }),
}));

const WHATSAPP_HREF = 'https://wa.me/5541997696781?text=Oi!%20Vim%20pelo%20site%20do%20MindCat.';

describe('Landing — Fale com a gente', () => {
  it('leva ao Instagram em outra aba, sem passar referrer', () => {
    render(<LandingPage />);

    const link = screen.getByRole('link', { name: 'Instagram' });

    expect(link).toHaveAttribute('href', 'https://www.instagram.com/_mindcat/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('leva ao WhatsApp com o número e a mensagem codificada', () => {
    render(<LandingPage />);

    const link = screen.getByRole('link', { name: 'WhatsApp' });

    expect(link).toHaveAttribute('href', WHATSAPP_HREF);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('mostra a seção de contato antes do rodapé', () => {
    render(<LandingPage />);

    expect(screen.getByText('Fale com a gente')).toBeInTheDocument();
  });

  it('não monta o flutuante antes da rolagem', () => {
    render(<LandingPage />);

    expect(
      screen.queryByRole('link', { name: 'Conversar com o MindCat no WhatsApp' }),
    ).not.toBeInTheDocument();
  });
});
