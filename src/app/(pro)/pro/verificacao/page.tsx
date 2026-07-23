'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { isReviewOverdue } from '@/lib/credential';
import {
  useCredential,
  useSubmitCredential,
  credentialErrorMessage,
} from '@/hooks/useCredential';

export default function VerificacaoPage() {
  const { data: credential, isLoading } = useCredential();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" label="Carregando" />
      </div>
    );
  }

  const status = credential?.status ?? 'pending';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Verificação profissional</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Para atender pacientes, seu registro precisa ser validado por nossa equipe.
        </p>
      </header>

      {status === 'approved' ? (
        isReviewOverdue(credential) ? <ReviewDueCard /> : <ApprovedCard />
      ) : status === 'submitted' || status === 'under_review' ? (
        <UnderReviewCard />
      ) : (
        <SubmissionForm
          rejected={status === 'rejected'}
          expired={status === 'expired'}
          rejectionReason={credential?.rejection_reason ?? null}
        />
      )}
    </div>
  );
}

function ApprovedCard() {
  return (
    <Card>
      <CardBody className="space-y-3 text-center">
        <p className="text-lg font-semibold text-success">Credencial aprovada</p>
        <p className="text-sm text-ink-soft">
          Tudo certo. Você já pode acompanhar seus pacientes.
        </p>
        <div className="flex justify-center pt-1">
          <Link href="/pro">
            <Button>Ir para o painel</Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

function UnderReviewCard() {
  return (
    <Card>
      <CardBody className="space-y-2 text-center">
        <p className="text-lg font-semibold text-ink">Em análise</p>
        <p className="text-sm text-ink-soft">
          Recebemos seus documentos e estamos verificando seu registro. Você será
          avisado assim que a análise terminar.
        </p>
      </CardBody>
    </Card>
  );
}

function ReviewDueCard() {
  return (
    <Card>
      <CardBody className="space-y-2 text-center">
        <p className="text-lg font-semibold text-warning">Revisão vencida</p>
        <p className="text-sm text-ink-soft">
          Sua credencial precisa ser revalidada. O reenvio dos documentos será
          liberado assim que o prazo de carência terminar.
        </p>
      </CardBody>
    </Card>
  );
}

function SubmissionForm({
  rejected,
  expired,
  rejectionReason,
}: {
  rejected: boolean;
  expired: boolean;
  rejectionReason: string | null;
}) {
  const submit = useSubmitCredential();
  const toast = useToast();

  const [crpNumber, setCrpNumber] = useState('');
  const [crpRegion, setCrpRegion] = useState('');
  const [epsi, setEpsi] = useState(false);
  const [crpDoc, setCrpDoc] = useState<File | null>(null);
  const [epsiDoc, setEpsiDoc] = useState<File | null>(null);
  const [error, setError] = useState<string>();

  const resending = rejected || expired;

  async function handleSubmit() {
    if (!crpNumber.trim()) return setError('Informe o número do CRP.');
    if (!epsi) return setError('Confirme seu registro no e-Psi para continuar.');
    if (!crpDoc) return setError('Anexe o comprovante do CRP.');
    if (!epsiDoc) return setError('Anexe o comprovante do e-Psi.');
    setError(undefined);

    const form = new FormData();
    form.append('crp_number', crpNumber.trim());
    if (crpRegion.trim()) form.append('crp_region', crpRegion.trim());
    form.append('epsi_registered', '1');
    form.append('crp_document', crpDoc);
    form.append('epsi_document', epsiDoc);

    try {
      await submit.mutateAsync(form);
      toast.success('Documentos enviados para análise.');
    } catch (e) {
      toast.error(credentialErrorMessage(e));
    }
  }

  return (
    <Card>
      <CardHeader
        title={resending ? 'Reenviar documentos' : 'Enviar para análise'}
        description="Informe seu CRP e anexe os comprovantes de CRP e e-Psi (PDF ou imagem, até 5 MB)."
      />
      <CardBody className="space-y-4">
        {expired && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
            <p className="text-sm font-medium text-warning">Sua credencial venceu.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Reenvie os comprovantes para voltar a atender seus pacientes.
            </p>
          </div>
        )}

        {rejected && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-3">
            <p className="text-sm font-medium text-danger">Sua submissão anterior foi recusada.</p>
            {rejectionReason && (
              <p className="mt-1 text-sm text-ink-soft">Motivo: {rejectionReason}</p>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <Input
            label="Número do CRP"
            value={crpNumber}
            onChange={(e) => setCrpNumber(e.target.value)}
            placeholder="06/123456"
            disabled={submit.isPending}
          />
          <Input
            label="Região (opcional)"
            value={crpRegion}
            onChange={(e) => setCrpRegion(e.target.value)}
            placeholder="06"
            maxLength={4}
            disabled={submit.isPending}
          />
        </div>

        <FileField
          label="Comprovante do CRP"
          file={crpDoc}
          onSelect={setCrpDoc}
          disabled={submit.isPending}
        />
        <FileField
          label="Comprovante do e-Psi"
          file={epsiDoc}
          onSelect={setEpsiDoc}
          disabled={submit.isPending}
        />

        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={epsi}
            onChange={(e) => setEpsi(e.target.checked)}
            disabled={submit.isPending}
            className="mt-0.5 h-4 w-4 rounded border-line text-purple-500 focus:ring-purple-300"
          />
          <span className="text-sm text-ink-soft">
            Declaro que possuo registro ativo no e-Psi (Cadastro Nacional de
            Psicólogos) para atendimento online.
          </span>
        </label>

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSubmit} loading={submit.isPending}>
            {resending ? 'Reenviar' : 'Enviar para análise'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function FileField({
  label,
  file,
  onSelect,
  disabled,
}: {
  label: string;
  file: File | null;
  onSelect: (file: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-purple-200 disabled:opacity-60"
        >
          Escolher arquivo
        </button>
        <span className="min-w-0 flex-1 truncate text-sm text-ink-faint">
          {file ? file.name : 'Nenhum arquivo selecionado'}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        disabled={disabled}
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}