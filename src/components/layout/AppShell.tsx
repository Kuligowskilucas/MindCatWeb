'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sidebar, SidebarNav, type NavKind } from './Sidebar';
import { MenuIcon } from '@/components/icons';

interface AppShellProps {
  kind: NavKind;
  children: React.ReactNode;
}

export function AppShell({ kind, children }: AppShellProps) {
  // O drawer fecha ao clicar num link (onNavigate abaixo), então não precisa
  // de efeito escutando a rota — cada navegação já parte de um clique no menu.
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Trava o scroll do body enquanto o drawer está aberto e fecha no Esc.
  useEffect(() => {
    if (!drawerOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }

    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar fixa (desktop, lg+) */}
      <Sidebar kind={kind} />

      {/* Drawer (mobile) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-64 max-w-[80%] border-r border-line bg-surface shadow-xl">
            <SidebarNav kind={kind} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile, abaixo de lg) */}
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-purple-50 hover:text-ink"
          >
            <MenuIcon aria-hidden className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <Image src="/icone.png" alt="" width={24} height={24} />
            <span className="text-base font-semibold text-ink">MindCat</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}