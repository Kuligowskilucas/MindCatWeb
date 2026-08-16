'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { MoonIcon, SunIcon } from '@/components/icons';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className={cn(
        'inline-flex items-center justify-center rounded-lg p-2 text-ink-soft transition-colors hover:bg-purple-50 hover:text-ink',
        className,
      )}
    >
      {theme === 'dark' ? <SunIcon aria-hidden className="h-5 w-5" /> : <MoonIcon aria-hidden className="h-5 w-5" />}
    </button>
  );
}
