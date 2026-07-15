'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/components/ui/Toast';
import { useUpdateAccount, accountErrorMessage } from '@/hooks/useAccount';
import { ApiError } from '@/lib/http';
import { validatePassword } from '@/lib/validation';

export function PasswordChangeForm() {
  const update = useUpdateAccount();
  const toast = useToast();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string }>({});

  async function submit() {
    setErrors({});

    if (!current) {
      setErrors({ current: 'Informe sua senha atual.' });
      return;
    }
    const rule = validatePassword(next);
    if (rule) {
      setErrors({ next: rule });
      return;
    }
    if (next !== confirm) {
      setErrors({ next: 'As senhas não conferem.' });
      return;
    }

    try {
      await update.mutateAsync({ password: next, current_password: current });
      toast.success('Senha alterada.');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        // 'Senha atual incorreta.' vem em current_password.
        setErrors({
          current: err.fieldError('current_password'),
          next: err.fieldError('password'),
        });
      } else {
        toast.error(accountErrorMessage(err));
      }
    }
  }

  return (
    <Card>
      <CardHeader
        title="Trocar senha"
        description="Você precisa informar a senha atual para definir uma nova."
      />
      <CardBody className="space-y-4">
        <PasswordInput
          label="Senha atual"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          error={errors.current}
          disabled={update.isPending}
        />
        <PasswordInput
          label="Nova senha"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres, com maiúscula, minúscula e número."
          value={next}
          onChange={(e) => setNext(e.target.value)}
          error={errors.next}
          disabled={update.isPending}
        />
        <PasswordInput
          label="Confirme a nova senha"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={update.isPending}
        />
        <div className="flex justify-end">
          <Button loading={update.isPending} onClick={submit}>
            Alterar senha
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}