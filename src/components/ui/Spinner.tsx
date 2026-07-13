import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
} as const;

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden
        className={cn(
          'inline-block animate-spin rounded-full border-purple-200 border-t-purple-400',
          SIZES[size],
        )}
      />
      <span className="sr-only">{label ?? 'Carregando'}</span>
    </span>
  );
}