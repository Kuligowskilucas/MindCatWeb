'use client';

import { cn } from '@/lib/cn';
import type { Feeling } from '@/lib/types';

const MAX_FEELINGS = 5;

interface FeelingPickerProps {
  feelings: Feeling[];
  selected: string[];
  onChange: (slugs: string[]) => void;
  disabled?: boolean;
}

export function FeelingPicker({ feelings, selected, onChange, disabled }: FeelingPickerProps) {
  const limitReached = selected.length >= MAX_FEELINGS;

  function toggle(slug: string) {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
      return;
    }
    if (limitReached) return;
    onChange([...selected, slug]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Sentimentos de hoje">
        {feelings.map((feeling) => {
          const isSelected = selected.includes(feeling.slug);
          const isDisabled = disabled || (!isSelected && limitReached);

          return (
            <button
              key={feeling.slug}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled}
              onClick={() => toggle(feeling.slug)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? 'border-purple-400 bg-purple-400 text-white'
                  : 'border-line bg-surface text-ink-soft hover:border-purple-200 hover:bg-purple-50',
              )}
            >
              {feeling.label}
            </button>
          );
        })}
      </div>

      {limitReached && (
        <p className="mt-2 text-xs text-ink-faint">
          Você já marcou o máximo de {MAX_FEELINGS} sentimentos. Desmarque um para trocar.
        </p>
      )}
    </div>
  );
}
