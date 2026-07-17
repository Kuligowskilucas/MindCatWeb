'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { patientsApi, type PatientSearchResult } from '@/lib/api/patients';
import { useLinkPatient, patientErrorMessage } from '@/hooks/usePatients';
import { validateEmail } from '@/lib/validation';

interface AddPatientDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Fluxo em dois passos dentro do mesmo Dialog:
 *  1. busca por email (botão "Buscar");
 *  2. mostra o paciente e, SE ele já consentiu, libera o "Vincular".
 * Sem consentimento, o botão de ação some — só dá pra fechar e orientar.
 */
export function AddPatientDialog({ open, onClose }: AddPatientDialogProps) {
  const toast = useToast();
  const link = useLinkPatient();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<PatientSearchResult | null>(null);

  const busy = searching || link.isPending;

  function reset() {
    setEmail('');
    setEmailError(undefined);
    setFound(null);
    setSearching(false);
  }

  function handleClose() {
    if (busy) return;
    reset();
    onClose();
  }

  async function doSearch() {
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError(undefined);
    setSearching(true);
    try {
      const result = await patientsApi.search(email.trim());
      setFound(result);
    } catch (e) {
      setFound(null);
      setEmailError(patientErrorMessage(e));
    } finally {
      setSearching(false);
    }
  }

  async function doLink() {
    if (!found) return;
    try {
      await link.mutateAsync(found.id);
      toast.success(`${found.name} vinculado.`);
      reset();
      onClose();
    } catch (e) {
      toast.error(patientErrorMessage(e));
    }
  }

  const canLink = found?.consent === true;

  // O botão de ação do Dialog muda conforme o passo. Sem consentimento, não
  // passamos onConfirm, então o Dialog exibe apenas o Cancelar.
  const confirmProps =
    found === null
      ? { confirmLabel: 'Buscar', onConfirm: doSearch }
      : canLink
        ? { confirmLabel: 'Vincular', onConfirm: doLink }
        : {};

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Adicionar paciente"
      description="Busque pelo email cadastrado do paciente."
      loading={busy}
      {...confirmProps}
    >
      <div className="space-y-4">
        <Input
          label="Email do paciente"
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            // Mudou o email → volta pro passo de busca (esconde o resultado).
            if (found) setFound(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && found === null && !busy) {
              e.preventDefault();
              doSearch();
            }
          }}
          error={emailError}
          disabled={busy}
          placeholder="paciente@exemplo.com"
        />

        {found && (
          <div className="rounded-lg border border-line bg-canvas p-3">
            <p className="text-sm font-medium text-ink">{found.name}</p>
            <p className="text-xs text-ink-faint">{found.email}</p>
            {canLink ? (
              <p className="mt-2 text-xs text-success">
                Consentimento ativo — pronto para vincular.
              </p>
            ) : (
              <p className="mt-2 text-xs text-warning">
                Este paciente ainda não autorizou o compartilhamento de dados no
                app. Peça que ative o consentimento no perfil antes de vincular.
              </p>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}