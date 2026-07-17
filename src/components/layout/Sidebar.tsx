'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ComponentType, type SVGProps } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog } from '@/components/ui/Dialog';
import { cn } from '@/lib/cn';
import { HomeIcon, DiaryIcon, TasksIcon, ProfileIcon, PatientsIcon } from '@/components/icons';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  href: string;
  label: string;
  icon: IconType;
}

export type NavKind = 'patient' | 'pro' | 'admin';

// As funções de ícone ficam DENTRO do client component — não cruzam
// a fronteira server→client (foi isso que quebrou antes).
const NAV: Record<NavKind, NavItem[]> = {
  patient: [
    { href: '/hoje',    label: 'Hoje',    icon: HomeIcon },
    { href: '/diario',  label: 'Diário',  icon: DiaryIcon },
    { href: '/tarefas', label: 'Tarefas', icon: TasksIcon },
    { href: '/perfil',  label: 'Perfil',  icon: ProfileIcon },
  ],
  pro: [
    { href: '/pro',          label: 'Pacientes', icon: PatientsIcon },
    { href: '/pro/tarefas',  label: 'Tarefas',   icon: TasksIcon },
    { href: '/pro/perfil',   label: 'Perfil',    icon: ProfileIcon },
  ],
  admin: [
    { href: '/admin', label: 'Validação CRP', icon: ProfileIcon },
  ],
};

/**
 * Conteúdo interno da navegação, reaproveitado em dois lugares: a sidebar fixa
 * (desktop) e o drawer deslizante (mobile). onNavigate fecha o drawer ao clicar
 * num link — no desktop fica undefined e não faz nada.
 */
export function SidebarNav({
  kind,
  onNavigate,
}: {
  kind: NavKind;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const items = NAV[kind];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <Image src="/icone.png" alt="" width={32} height={32} />
        <span className="text-lg font-semibold text-ink">MindCat</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const active =
            matches &&
            !items.some(
              (other) =>
                other.href.length > item.href.length &&
                (pathname === other.href ||
                  pathname.startsWith(`${other.href}/`)),
            );
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-ink-soft hover:bg-purple-50/60 hover:text-ink',
              )}
            >
              <item.icon aria-hidden className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <div className="mb-2 px-3 py-1">
          <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
          <p className="truncate text-xs text-ink-faint">{user?.email}</p>
        </div>
        <button onClick={() => setConfirmLogout(true)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-soft hover:bg-purple-50 hover:text-ink">
          Sair
        </button>
      </div>

      <Dialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Sair da conta?"
        description="Você precisará entrar novamente para acessar seus dados."
        confirmLabel="Sair"
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
      />
    </div>
  );
}

/** Sidebar fixa — visível só a partir de lg (no mobile usamos o drawer). */
export function Sidebar({ kind }: { kind: NavKind }) {
  return (
    <aside className="hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <SidebarNav kind={kind} />
    </aside>
  );
}