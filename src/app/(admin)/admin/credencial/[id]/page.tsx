'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { ChevronLeftIcon } from '@/components/icons';
import type { AdminCredentialDetail } from '@/lib/api/adminCredentials';
import type { Profession } from '@/lib/api/credentials';
import {
  useAdminCredentialDetail,
  useApproveCredential,
  useRejectCredential,
  adminCredentialErrorMessage,
} from '@/hooks/useAdminCredentials';

const KIND_LABEL: Record<string, string> = {
  crp_card: 'Comprovante do CRP',
  crm_card: 'Comprovante do CRM',
  epsi_proof: 'Comprovante do e-Psi',
  diploma: 'Diploma',
  other: 'Documento',
};

const PROFESSION_LABEL: Record<Profession, string> = {
  psychologist: 'Psicólogo(a)',
  psychiatrist: 'Psiquiatra',
};

export default function AdminCredentialDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data, isLoading, error } = useAdminCredentialDetail(id);
  const approve = useApproveCredential();
  const reject = useRejectCredential();
  const toast = useToast();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string>();

  async function handleApprove() {
    try {
      await approve.mutateAsync(id);
      toast.success('Credencial aprovada.');
    } catch (e) {
      toast.error(adminCredentialErrorMessage(e));
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setReasonError('Informe o motivo.');
      return;
    }
    setReasonError(undefined);
    try {
      await reject.mutateAsync({ id, reason: reason.trim() });
      toast.success('Credencial recusada.');
      setRejectOpen(false);
      setReason('');
    } catch (e) {
      toast.error(adminCredentialErrorMessage(e));
    }
  }

  const pending =
    data?.credential.status === 'submitted' ||
    data?.credential.status === 'under_review';
  const incomplete =
    !!data && (!data.credential.profession || !data.credential.registration_number);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-purple-600"
      >
        <ChevronLeftIcon aria-hidden className="h-4 w-4" />
        Fila
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-14">
          <Spinner size="lg" label="Carregando" />
        </div>
      ) : error || !data ? (
        <Card>
          <EmptyState
            title="Não foi possível carregar"
            action={
              <Link href="/admin">
                <Button variant="secondary">Voltar</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <header>
            <h1 className="text-2xl font-semibold text-ink">
              {data.credential.user?.name ?? 'Profissional'}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{data.credential.user?.email}</p>
          </header>

          <Card>
            <CardHeader title="Registro" />
            <CardBody className="space-y-1.5 text-sm">
              <RegistrationRows credential={data.credential} />
              <Row label="Status" value={data.credential.status} />
              {data.credential.rejection_reason && (
                <Row label="Motivo anterior" value={data.credential.rejection_reason} />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Documentos"
              description="Os links são temporários (validade de poucos minutos)."
            />
            <CardBody>
              {data.documents.length === 0 ? (
                <p className="text-sm text-ink-soft">Nenhum documento enviado.</p>
              ) : (
                <ul className="space-y-2">
                  {data.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-sm text-ink">
                          {KIND_LABEL[doc.kind] ?? 'Documento'}
                        </span>
                        <span className="block truncate text-xs text-ink-faint">
                          {doc.original_name}
                        </span>
                      </span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-sm font-medium text-purple-600 hover:underline"
                      >
                        Abrir
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {pending && incomplete && (
            <p className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-ink-soft" role="status">
              Esta credencial não tem profissão ou número de registro. A API recusa a aprovação
              nesse caso; recuse com um motivo para o profissional reenviar.
            </p>
          )}

          {pending ? (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setRejectOpen(true)}>
                Recusar
              </Button>
              <Button onClick={handleApprove} loading={approve.isPending}>
                Aprovar
              </Button>
            </div>
          ) : (
            <p className="text-right text-sm text-ink-faint">
              Esta credencial já foi decidida.
            </p>
          )}
        </>
      )}

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Recusar credencial"
        description="O profissional verá o motivo e poderá reenviar os documentos."
        confirmLabel="Recusar"
        confirmVariant="danger"
        loading={reject.isPending}
        onConfirm={handleReject}
      >
        <Input
          label="Motivo"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={reasonError}
          placeholder="Ex.: documento ilegível"
          maxLength={500}
          disabled={reject.isPending}
        />
      </Dialog>
    </div>
  );
}

function RegistrationRows({ credential }: { credential: AdminCredentialDetail['credential'] }) {
  const { profession, council } = credential;
  const regionLabel = council === 'CRM' ? 'UF' : council === 'CRP' ? 'Região' : 'Região/UF';

  return (
    <>
      <Row label="Profissão" value={profession ? PROFESSION_LABEL[profession] : 'Não informada'} />
      <Row label="Conselho" value={council ?? '—'} />
      <Row label="Número" value={credential.registration_number ?? '—'} />
      <Row label={regionLabel} value={credential.registration_region ?? '—'} />
      {profession === 'psychiatrist' && (
        <Row label="RQE" value={credential.rqe_number ?? 'Não informado'} />
      )}
      {profession === 'psychologist' && (
        <Row label="e-Psi declarado" value={credential.epsi_registered ? 'Sim' : 'Não'} />
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-ink-faint">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}