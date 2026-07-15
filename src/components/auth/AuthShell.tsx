import type { ReactNode } from 'react';
import Image from 'next/image';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Image
            src="/icone.png"
            alt="MindCat"
            width={72}
            height={72}
            priority
          />
          <h1 className="mt-2 text-2xl font-semibold text-ink">MindCat</h1>
        </div>

        <div className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
          </div>
          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>
        )}
      </div>
    </main>
  );
}