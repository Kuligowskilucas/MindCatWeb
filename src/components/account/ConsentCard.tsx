'use client';

import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useProfile, useUpdateConsent, accountErrorMessage } from '@/hooks/useAccount';
import { cn } from '@/lib/cn';

export function ConsentCard() {
  const { data: profile, isLoading } = useProfile();
  const updateConsent = useUpdateConsent();
  const toast = useToast();

  const enabled = profile?.consent_share_with_professional ?? false;

  async function toggle() {
    try {
      await updateConsent.mutateAsync(!enabled);
      toast.success(
        !enabled
          ? 'Compartilhamento ativado.'
          : 'Compartilhamento desativado.',
      );
    } catch (err) {
      toast.error(accountErrorMessage(err));
    }
  }

  return (
    <Card>
      <CardHeader
        title="Privacidade"
        description="Você controla se seu psicólogo pode ver seus dados no MindCat."
      />
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner label="Carregando" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                Compartilhar meus dados com meu psicólogo
              </p>
              <p className="mt-0.5 text-sm text-ink-soft">
                Quando desligado, seu psicólogo deixa de ver suas tarefas e
                resumo. Seu diário nunca é compartilhado.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="Compartilhar meus dados com meu psicólogo"
              disabled={updateConsent.isPending}
              onClick={toggle}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                enabled ? 'bg-purple-400' : 'bg-line',
                updateConsent.isPending && 'opacity-60',
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                  enabled ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}