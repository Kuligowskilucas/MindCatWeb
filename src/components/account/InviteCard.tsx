'use client';

import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useProfile } from '@/hooks/useAccount';
import {
  useActiveInvite,
  useGenerateInvite,
  useRevokeInvite,
  inviteErrorMessage,
} from '@/hooks/useInvites';

export function InviteCard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: invite, isLoading: inviteLoading } = useActiveInvite();
  const generate = useGenerateInvite();
  const revoke = useRevokeInvite();
  const toast = useToast();

  const consented = profile?.consent_share_with_professional ?? false;
  const busy = generate.isPending || revoke.isPending;

  async function handleGenerate() {
    try {
      await generate.mutateAsync();
    } catch (err) {
      toast.error(inviteErrorMessage(err));
    }
  }

  async function handleRevoke() {
    try {
      await revoke.mutateAsync();
      toast.success('Convite revogado.');
    } catch (err) {
      toast.error(inviteErrorMessage(err));
    }
  }

  async function handleCopy() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.code);
      toast.success('Código copiado.');
    } catch {
      toast.error('Não foi possível copiar. Copie o código manualmente.');
    }
  }

  return (
    <Card>
      <CardHeader
        title="Convidar meu psicólogo"
        description="Gere um código e envie ao seu psicólogo para que ele possa acompanhar você no MindCat."
      />
      <CardBody>
        {profileLoading || inviteLoading ? (
          <div className="flex justify-center py-4">
            <Spinner label="Carregando" />
          </div>
        ) : !consented ? (
          <p className="text-sm text-ink-soft">
            Ative o compartilhamento de dados acima para poder convidar seu psicólogo.
          </p>
        ) : invite ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-canvas p-4 text-center">
              <p className="font-mono text-2xl font-semibold tracking-[0.3em] text-ink">
                {invite.code}
              </p>
              <p className="mt-2 text-xs text-ink-faint">
                Expira em {formatExpiry(invite.expires_at)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleCopy} disabled={busy}>
                Copiar código
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleGenerate}
                loading={generate.isPending}
                disabled={busy}
              >
                Gerar novo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRevoke}
                loading={revoke.isPending}
                disabled={busy}
              >
                Revogar
              </Button>
            </div>

            <p className="text-xs text-ink-faint">
              Gerar um novo código invalida o anterior — só um fica ativo por vez.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">
              Você ainda não tem um código de convite ativo.
            </p>
            <Button size="sm" onClick={handleGenerate} loading={generate.isPending}>
              Gerar código de convite
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function formatExpiry(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}