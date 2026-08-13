'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const FILTERS: { label: string; value: string | undefined }[] = [
  { label: 'Todas', value: undefined },
  { label: 'Aprovações', value: 'credential.approved' },
  { label: 'Recusas', value: 'credential.rejected' },
];

const ACTION_LABEL: Record<string, string> = {
  'credential.approved': 'Aprovou credencial',
  'credential.rejected': 'Recusou credencial',
};

export default function AuditoriaPage() {
  const [action, setAction] = useState<string | undefined>(undefined);
  const { data: logs, isLoading, isError, refetch } = useAuditLogs(action);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Auditoria</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Registro de ações administrativas: quem fez o quê e quando.
        </p>
      </header>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setAction(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              action === f.value
                ? 'bg-purple-100 text-purple-700'
                : 'text-ink-soft hover:bg-purple-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-14">
          <Spinner size="lg" label="Carregando" />
        </div>
      ) : isError ? (
        <Card>
          <EmptyState
            title="Não foi possível carregar"
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Tentar de novo
              </Button>
            }
          />
        </Card>
      ) : !logs || logs.length === 0 ? (
        <Card>
          <EmptyState title="Nada por aqui" description="Nenhuma ação registrada." />
        </Card>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => {
            const meta = log.metadata;
            const reason =
              meta && typeof meta.reason === 'string' ? meta.reason : null;

            return (
              <Card as="li" key={log.id}>
                <div className="flex items-start justify-between gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">
                      {log.actor?.name ?? 'Usuário removido'}
                      {' · '}
                      {ACTION_LABEL[log.action] ?? log.action}
                      {log.auditable_id ? ` #${log.auditable_id}` : ''}
                    </span>
                    {reason && (
                      <span className="mt-0.5 block text-xs text-ink-soft">
                        Motivo: {reason}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-ink-faint">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
