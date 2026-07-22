'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useRedeemInvite, redeemErrorMessage } from '@/hooks/useInvites';

interface AddPatientDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddPatientDialog({ open, onClose }: AddPatientDialogProps) {
  const toast = useToast();
  const redeem = useRedeemInvite();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  function reset() {
    setCode('');
    setError(undefined);
  }

  function handleClose() {
    if (redeem.isPending) return;
    reset();
    onClose();
  }

  async function doRedeem() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Informe o código do convite.');
      return;
    }
    setError(undefined);
    try {
      await redeem.mutateAsync(trimmed);
      toast.success('Paciente vinculado.');
      reset();
      onClose();
    } catch (e) {
      setError(redeemErrorMessage(e));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Adicionar paciente"
      description="Peça ao paciente o código de convite gerado no app dele e cole aqui."
      confirmLabel="Vincular"
      onConfirm={doRedeem}
      loading={redeem.isPending}
    >
      <Input
        label="Código do convite"
        autoComplete="off"
        autoCapitalize="characters"
        value={code}
        onChange={(e) => {
          setCode(e.target.value.toUpperCase());
          if (error) setError(undefined);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !redeem.isPending) {
            e.preventDefault();
            doRedeem();
          }
        }}
        error={error}
        disabled={redeem.isPending}
        placeholder="Ex.: ABCD2345"
        className="font-mono tracking-[0.2em]"
      />
    </Dialog>
  );
}