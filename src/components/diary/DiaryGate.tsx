'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/components/ui/Toast';
import { useSetDiaryPassword, useUnlockDiary, diaryErrorMessage } from '@/hooks/useDiary';
import { validatePassword } from '@/lib/validation';

interface DiaryGateProps {
  /** Já existe senha do diário? Decide entre "destravar" e "criar". */
  hasPassword: boolean;
  /** Chamado com a senha em claro assim que o diário é liberado. */
  onUnlocked: (password: string) => void;
}

export function DiaryGate({ hasPassword, onUnlocked }: DiaryGateProps) {
  const toast = useToast();
  const unlock = useUnlockDiary();
  const setPassword = useSetDiaryPassword();

  // Campos dos dois modos. A senha vive só aqui (estado React), nunca no
  // localStorage — é dado sensível e alvo de XSS.
  const [password, setPasswordValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setError(null);
    if (!password) {
      setError('Digite a senha do diário.');
      return;
    }
    try {
      await unlock.mutateAsync(password);
      onUnlocked(password);
    } catch (err) {
      setError(diaryErrorMessage(err));
    }
  }

  async function handleCreate() {
    setError(null);

    const rule = validatePassword(newPassword);
    if (rule) {
      setError(rule);
      return;
    }
    if (newPassword !== confirm) {
      setError('As senhas não conferem.');
      return;
    }

    try {
      // Primeiro cadastro: não manda current_password (o backend não exige).
      await setPassword.mutateAsync({ new_password: newPassword });
      toast.success('Senha do diário criada.');
      // Já sabemos a senha que o usuário digitou: entra direto no diário.
      onUnlocked(newPassword);
    } catch (err) {
      setError(diaryErrorMessage(err));
    }
  }

  if (hasPassword) {
    return (
      <Card>
        <CardHeader
          title="Diário trancado"
          description="Digite a senha do diário para ler e escrever."
        />
        <CardBody className="space-y-4">
          <PasswordInput
            label="Senha do diário"
            autoComplete="off"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            error={error ?? undefined}
          />
          <Button fullWidth loading={unlock.isPending} onClick={handleUnlock}>
            Destravar
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Criar senha do diário"
        description="O diário tem uma senha separada da sua conta. Você vai digitá-la sempre que quiser ler suas anotações."
      />
      <CardBody className="space-y-4">
        <PasswordInput
          label="Nova senha do diário"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres, com maiúscula, minúscula e número."
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={error ?? undefined}
        />
        <PasswordInput
          label="Confirme a senha"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button fullWidth loading={setPassword.isPending} onClick={handleCreate}>
          Criar senha
        </Button>
      </CardBody>
    </Card>
  );
}