import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>alternar</button>
    </div>
  );
}

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  document.cookie = 'mindcat_theme=; path=/; max-age=0';
  document.documentElement.removeAttribute('data-theme');
  mockMatchMedia(false);
});

describe('ThemeProvider', () => {
  it('usa o initialTheme vindo do server quando informado', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('sem initialTheme, segue prefers-color-scheme do sistema', () => {
    mockMatchMedia(true);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });

  it('toggleTheme alterna o estado, o atributo do DOM e grava o cookie', () => {
    render(
      <ThemeProvider initialTheme="light">
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    act(() => {
      screen.getByText('alternar').click();
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.cookie).toContain('mindcat_theme=dark');

    act(() => {
      screen.getByText('alternar').click();
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.cookie).toContain('mindcat_theme=light');
  });
});

describe('useTheme', () => {
  it('lança erro quando usado fora do ThemeProvider', () => {
    function Bare() {
      useTheme();
      return null;
    }

    expect(() => render(<Bare />)).toThrow('useTheme precisa estar dentro de <ThemeProvider>.');
  });
});
