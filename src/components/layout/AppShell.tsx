import { Sidebar, type NavKind } from './Sidebar';

interface AppShellProps {
  kind: NavKind;
  children: React.ReactNode;
}

export function AppShell({ kind, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar kind={kind} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}