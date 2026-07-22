'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import { MOOD_LEVELS, MOOD_META } from '@/lib/moodMeta';
import type { MoodLevel } from '@/lib/types';

interface MoodScaleProps {
  value: MoodLevel | null;
  onChange: (level: MoodLevel) => void;
  disabled?: boolean;
  size?: 'md' | 'lg';
}

const SIZES = {
  md: { img: 56, box: 'h-20 w-20' },
  lg: { img: 72, box: 'h-24 w-24' },
} as const;

export function MoodScale({ value, onChange, disabled, size = 'lg' }: MoodScaleProps) {
  const s = SIZES[size];

  return (
    <div
      role="radiogroup"
      aria-label="Como você está se sentindo?"
      className="flex flex-wrap justify-center gap-3"
    >
      {MOOD_LEVELS.map((level) => {
        const meta = MOOD_META[level];
        const selected = value === level;

        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={meta.label}
            disabled={disabled}
            onClick={() => onChange(level)}
            className={cn(
              'group flex flex-col items-center gap-1.5 rounded-card border-2 p-2 transition-all',
              'disabled:cursor-not-allowed disabled:opacity-50',
              selected
                ? 'border-transparent'
                : 'border-transparent hover:bg-purple-50',
            )}
            style={selected ? { backgroundColor: `${meta.tint}22`, borderColor: meta.tint } : undefined}
          >
            <span
              className={cn(
                'flex items-center justify-center rounded-full transition-transform',
                s.box,
                selected ? 'scale-100' : 'scale-90 opacity-70 group-hover:opacity-100 group-hover:scale-95',
              )}
            >
              <Image
                src={meta.image}
                alt=""
                width={s.img}
                height={s.img}
                className="h-auto w-auto object-contain"
                style={{ width: s.img, height: 'auto' }}
              />
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                selected ? 'text-ink' : 'text-ink-faint',
              )}
            >
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}