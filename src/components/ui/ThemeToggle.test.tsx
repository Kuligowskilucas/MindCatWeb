import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

beforeEach(() => {
  document.cookie = 'mindcat_theme=; path=/; max-age=0';
  document.documentElement.removeAttribute('data-theme');
  window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

describe('ThemeToggle', () => {
  it('alterna o aria-label ao clicar', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider initialTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole('button', { name: 'Mudar para tema escuro' });
    await user.click(button);

    expect(screen.getByRole('button', { name: 'Mudar para tema claro' })).toBeInTheDocument();
  });
});
