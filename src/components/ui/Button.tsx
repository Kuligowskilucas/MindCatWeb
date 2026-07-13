'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-purple-400 text-white hover:bg-purple-500 active:bg-purple-600 disabled:bg-purple-200',
  secondary:
    'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 active:bg-purple-100 disabled:text-ink-faint disabled:border-line',
  ghost:
    'bg-transparent text-ink-soft hover:bg-purple-50 hover:text-purple-600 active:bg-purple-100',
  danger:
    'bg-white text-danger border border-danger/30 hover:bg-danger/5 active:bg-danger/10',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className="[&>span:first-child]:border-current/30 [&>span:first-child]:border-t-current" />}
      {children}
    </button>
  );
});