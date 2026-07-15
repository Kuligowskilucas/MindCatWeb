'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { accountErrorMessage } from '@/hooks/useAccount';

const CONFIRM_WORD = 'EXCLUIR';

export function DangerZone() {
  const { deleteAccount } = useAuth();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canConfirm = confirmText.trim().toUpperCase() === CONFIRM_WORD;

  function close() {
    if (deleting) return;
    setOpen(false);
    setConfirmText('');
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      // deleteAccount faz o teardown de sessão e redireciona no sucesso;
      // esta tela é desmontada pela navegação.
      await deleteAccount();
      toast.success('Sua conta foi excluída.');
    } catch (err) {
      toast.error(accountErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="border-danger/30">
        <CardHeader
          title="Excluir conta"
          description="Encerrar sua conta no MindCat de forma permanente."
        />
        <CardBody className="space-y-4">
          <p className="text-sm text-ink-soft">
            Seu diário e seus registros de humor são apagados para sempre. Suas
            tarefas são mantidas como registro clínico, sem vínculo com seus
            dados pessoais, e sua conta é anonimizada e desativada. Não dá para
            desfazer.
          </p>
          <div className="flex justify-end">
            <Button variant="danger" onClick={() => setOpen(true)}>
              Excluir minha conta
            </Button>
          </div>
        </CardBody>
      </Card>

      <Dialog
        open={open}
        onClose={close}
        title="Excluir sua conta?"
        description={
          <>
            Esta ação é <strong>permanente</strong>. Para confirmar, digite{' '}
            <strong>{CONFIRM_WORD}</strong> no campo abaixo.
          </>
        }
        confirmLabel="Excluir permanentemente"
        confirmVariant="danger"
        loading={deleting}
        // O botão de confirmar só aparece quando a palavra foi digitada certo:
        // sem onConfirm, o Dialog mostra apenas o Cancelar.
        onConfirm={canConfirm ? handleDelete : undefined}
      >
        <Input
          label={`Digite "${CONFIRM_WORD}" para confirmar`}
          autoComplete="off"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={deleting}
        />
      </Dialog>
    </>
  );
}