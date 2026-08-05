'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/api/profile';
import { ApiError } from '@/lib/http';

export function TwoFactorCard() {
  const { user, refresh } = useAuth();
  const toast = useToast();

  const enabled = user?.two_factor_enabled ?? false;

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function toggle() {
    setError(undefined);

    if (!password) {
      setError('Confirme sua senha.');
      return;
    }

    setSubmitting(true);
    try {
      await profileApi.setTwoFactor({ enabled: !enabled, password });
      await refresh();
      setPassword('');
      toast.success(
        enabled
          ? 'Verificação em duas etapas desativada.'
          : 'Verificação em duas etapas ativada.',
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError('Senha inválida.');
      } else if (err instanceof ApiError && err.status === 422) {
        setError(err.fieldError('password') ?? err.message);
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível alterar.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Verificação em duas etapas"
        description={
          enabled
            ? 'Ativada. A cada login enviamos um código de 6 dígitos para o seu e-mail.'
            : 'Desativada. Ative para exigir um código enviado por e-mail a cada login.'
        }
      />
      <CardBody className="space-y-4">
        <PasswordInput
          label="Senha atual"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          disabled={submitting}
        />
        <div className="flex justify-end">
          <Button
            loading={submitting}
            onClick={toggle}
            variant={enabled ? 'danger' : 'primary'}
          >
            {enabled ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}