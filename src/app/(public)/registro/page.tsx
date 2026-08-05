'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/http';
import type { Role } from '@/lib/types';
import { validateEmail, validateName, validatePassword } from '@/lib/validation';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
};

export default function RegistroPage() {
  const { register } = useAuth();
  const toast = useToast();

  const [role, setRole] = useState<Extract<Role, 'patient' | 'pro'>>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resending, setResending] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      passwordConfirm:
        password !== passwordConfirm ? 'As senhas não coincidem.' : undefined,
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setErrors({
          name: err.fieldError('name'),
          email: err.fieldError('email'),
          password: err.fieldError('password'),
        });
      } else if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Não conseguimos falar com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setResending(true);
    try {
      await authApi.resendVerification(email.trim());
      toast.success('E-mail reenviado. Confira sua caixa de entrada.');
    } catch {
      toast.error('Não conseguimos reenviar agora. Tente em instantes.');
    } finally {
      setResending(false);
    }
  }

  if (sent) {
    return (
      <AuthShell title="Confira seu e-mail">
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">
            Enviamos um link de confirmação para{' '}
            <strong className="text-ink">{email.trim()}</strong>. Abra o e-mail e
            clique no link para ativar sua conta.
          </p>
          <p className="text-sm text-ink-faint">
            Não recebeu? Verifique a caixa de spam ou reenvie o link.
          </p>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            loading={resending}
            onClick={onResend}
          >
            Reenviar e-mail
          </Button>

          <p className="text-center text-sm text-ink-soft">
            <Link href="/login" className="font-medium text-purple-600 hover:underline">
              Ir para o login
            </Link>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Criar conta"
      footer={
        <>
          Já tem conta?{' '}
          <Link href="/login" className="font-medium text-purple-600 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">
            Você é
          </span>
          <div className="grid grid-cols-2 gap-2">
            <RoleOption
              active={role === 'patient'}
              onClick={() => setRole('patient')}
              emoji="🧑"
              label="Paciente"
            />
            <RoleOption
              active={role === 'pro'}
              onClick={() => setRole('pro')}
              emoji="👩‍⚕️"
              label="Psicólogo(a)"
            />
          </div>
          {role === 'pro' && (
            <p className="mt-2 text-xs text-ink-faint">
              Contas profissionais passarão por verificação de CRP antes de
              acessar pacientes.
            </p>
          )}
        </div>

        <Input
          label="Nome completo"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={loading}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={loading}
        />

        <PasswordInput
          label="Senha"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="Mínimo 8 caracteres, com maiúscula, minúscula e número."
          disabled={loading}
        />

        <PasswordInput
          label="Confirmar senha"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          error={errors.passwordConfirm}
          disabled={loading}
        />

        <Button type="submit" fullWidth loading={loading}>
          Criar conta
        </Button>
      </form>
    </AuthShell>
  );
}

function RoleOption({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
        active
          ? 'border-purple-400 bg-purple-50 text-purple-700'
          : 'border-line bg-surface text-ink-soft hover:border-purple-200',
      )}
    >
      <span aria-hidden className="text-xl">{emoji}</span>
      {label}
    </button>
  );
}