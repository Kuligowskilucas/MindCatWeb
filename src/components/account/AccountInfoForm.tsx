'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateAccount, accountErrorMessage } from '@/hooks/useAccount';
import { ApiError } from '@/lib/http';
import { validateEmail, validateName } from '@/lib/validation';

export function AccountInfoForm() {
  const { user, refresh } = useAuth();
  const update = useUpdateAccount();
  const toast = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  async function submit() {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    if (nameErr || emailErr) {
      setErrors({ name: nameErr ?? undefined, email: emailErr ?? undefined });
      return;
    }
    setErrors({});

    // Manda só o que mudou — evita um PUT à toa e conflitos de unique no email.
    const payload: { name?: string; email?: string } = {};
    if (name.trim() !== user?.name) payload.name = name.trim();
    if (email.trim() !== user?.email) payload.email = email.trim();

    if (!payload.name && !payload.email) {
      toast.toast('Nada para salvar.');
      return;
    }

    try {
      await update.mutateAsync(payload);
      // Sincroniza o AuthContext (nome/email aparecem na sidebar).
      await refresh();
      toast.success('Dados atualizados.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setErrors({
          name: err.fieldError('name'),
          email: err.fieldError('email'),
        });
      } else {
        toast.error(accountErrorMessage(err));
      }
    }
  }

  return (
    <Card>
      <CardHeader title="Dados da conta" description="Seu nome e email de acesso." />
      <CardBody className="space-y-4">
        <Input
          label="Nome"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={update.isPending}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={update.isPending}
        />
        <div className="flex justify-end">
          <Button loading={update.isPending} onClick={submit}>
            Salvar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}