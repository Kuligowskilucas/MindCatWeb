'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, homeFor } from '@/contexts/AuthContext';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/http';
import { validateEmail } from '@/lib/validation';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const expirou = params.get('expirou') === '1';
  const proximo = params.get('proximo');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      router.replace(proximo ?? homeFor(user.role));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          setErrors({
            email: err.fieldError('email'),
            password: err.fieldError('password'),
          });
        } else if (err.status === 401) {
          toast.error('Email ou senha incorretos.');
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Não conseguimos falar com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Que bom te ver de novo."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link href="/registro" className="font-medium text-purple-600 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      {expirou && (
        <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-ink-soft">
          Sua sessão expirou. Entre novamente para continuar.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          disabled={loading}
        />

        <div>
          <PasswordInput
            label="Senha"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={loading}
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/esqueci-a-senha"
              className="text-sm text-purple-600 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-soft">Carregando…</div>}>
      <LoginForm />
    </Suspense>
  );
}