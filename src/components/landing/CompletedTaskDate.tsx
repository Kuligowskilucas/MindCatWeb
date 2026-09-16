'use client';

import { useHydrated } from './useHydrated';

interface CompletedTaskDateProps {
  daysAgo: number;
}

/** Mesmo formato do TaskList: "12 de julho de 2026". */
function format(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function CompletedTaskDate({ daysAgo }: CompletedTaskDateProps) {
  const hydrated = useHydrated();

  return (
    <span className="inline-block w-40 shrink-0 text-right text-xs text-ink-soft">
      {hydrated ? format(daysAgo) : null}
    </span>
  );
}
