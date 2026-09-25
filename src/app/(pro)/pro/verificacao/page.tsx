'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { isReviewOverdue } from '@/lib/credential';
import {
  COUNCIL_BY_PROFESSION,
  UFS,
  type Credential,
  type Profession,
} from '@/lib/api/credentials';
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
          A verificação é opcional, para ganhar o selo de verificado que seus pacientes veem.
          Você atende normalmente enquanto isso.
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
          previous={credential}
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
          Tudo certo. Seus pacientes veem o selo de verificado no seu nome.
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
          avisado assim que a análise terminar. Enquanto isso, o painel funciona normalmente.
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
          Seu registro precisa ser revalidado. Seu atendimento continua normalmente,
          mas o selo de verificado deixa de aparecer para seus pacientes quando o prazo
          de carência terminar. O reenvio dos documentos é liberado nesse momento.
        </p>
      </CardBody>
    </Card>
  );
}

const PROFESSION_OPTIONS: { value: Profession; label: string }[] = [
  { value: 'psychologist', label: 'Psicólogo(a)' },
  { value: 'psychiatrist', label: 'Psiquiatra' },
];

const CRP_REGIONS = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, '0'));

const SELECT_CLASS =
  'h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-purple-200 disabled:bg-purple-50 disabled:text-ink-faint';

function SubmissionForm({
  rejected,
  expired,
  rejectionReason,
  previous,
}: {
  rejected: boolean;
  expired: boolean;
  rejectionReason: string | null;
  previous?: Credential;
}) {
  const submit = useSubmitCredential();
  const toast = useToast();

  const [profession, setProfession] = useState<Profession | null>(previous?.profession ?? null);
  const [number, setNumber] = useState(previous?.registration_number ?? '');
  const [region, setRegion] = useState(previous?.registration_region ?? '');
  const [rqe, setRqe] = useState(previous?.rqe_number ?? '');
  const [epsi, setEpsi] = useState(false);
  const [registrationDoc, setRegistrationDoc] = useState<File | null>(null);
  const [epsiDoc, setEpsiDoc] = useState<File | null>(null);
  const [error, setError] = useState<string>();

  const resending = rejected || expired;
  const council = profession ? COUNCIL_BY_PROFESSION[profession] : null;
  const isPsychologist = profession === 'psychologist';

  function chooseProfession(next: Profession) {
    if (next === profession) return;
    setProfession(next);
    setNumber('');
    setRegion('');
    setRqe('');
    setEpsi(false);
    setRegistrationDoc(null);
    setEpsiDoc(null);
    setError(undefined);
  }

  async function handleSubmit() {
    if (!profession || !council) return setError('Escolha sua profissão.');
    if (!number.trim()) return setError(`Informe o número do ${council}.`);
    if (!region) {
      return setError(isPsychologist ? 'Escolha a região do CRP.' : 'Escolha a UF do CRM.');
    }
    if (isPsychologist && !epsi) return setError('Confirme seu registro no e-Psi para continuar.');
    if (!registrationDoc) return setError(`Anexe o comprovante do ${council}.`);
    if (isPsychologist && !epsiDoc) return setError('Anexe o comprovante do e-Psi.');
    setError(undefined);

    const form = new FormData();
    form.append('profession', profession);
    form.append('registration_number', number.trim());
    form.append('registration_region', region);
    form.append('registration_document', registrationDoc);
    if (isPsychologist && epsiDoc) {
      form.append('epsi_registered', '1');
      form.append('epsi_document', epsiDoc);
    }
    if (!isPsychologist && rqe.trim()) form.append('rqe_number', rqe.trim());

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
        description="Escolha sua profissão, informe o registro no conselho e anexe os comprovantes (PDF ou imagem, até 5 MB)."
      />
      <CardBody className="space-y-4">
        {expired && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
            <p className="text-sm font-medium text-warning">Sua credencial venceu.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Seus pacientes deixaram de ver o selo de verificado. Reenvie os comprovantes
              para recuperá-lo; seu atendimento não é afetado.
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

        <fieldset disabled={submit.isPending}>
          <legend className="mb-1.5 block text-sm font-medium text-ink">Profissão</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PROFESSION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors hover:border-purple-200 has-[:checked]:border-purple-400 has-[:checked]:bg-purple-50"
              >
                <input
                  type="radio"
                  name="profession"
                  value={option.value}
                  checked={profession === option.value}
                  onChange={() => chooseProfession(option.value)}
                  className="h-4 w-4 border-line text-purple-500 focus:ring-purple-300"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {profession && council && (
          <>
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <Input
                label={`Número do ${council}`}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder={isPsychologist ? '06/123456' : '123456'}
                maxLength={20}
                disabled={submit.isPending}
              />
              <SelectField
                label={isPsychologist ? 'Região do CRP' : 'UF do CRM'}
                value={region}
                onChange={setRegion}
                options={isPsychologist ? CRP_REGIONS : [...UFS]}
                disabled={submit.isPending}
              />
            </div>

            {!isPsychologist && (
              <Input
                label="RQE em Psiquiatria (opcional)"
                hint="Com o RQE, seus pacientes veem o selo de Psiquiatra; sem ele, de Médico(a)."
                value={rqe}
                onChange={(e) => setRqe(e.target.value)}
                maxLength={20}
                disabled={submit.isPending}
              />
            )}

            <FileField
              label={`Comprovante do ${council}`}
              file={registrationDoc}
              onSelect={setRegistrationDoc}
              disabled={submit.isPending}
            />

            {isPsychologist && (
              <>
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
              </>
            )}
          </>
        )}

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

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={SELECT_CLASS}
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
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
        aria-label={label}
        className="hidden"
        disabled={disabled}
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}