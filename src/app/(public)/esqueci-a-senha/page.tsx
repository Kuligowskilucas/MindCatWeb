'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToast } from '@/components/ui/Toast';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/http';
import { validateCode, validateEmail, validatePassword } from '@/lib/validation';

type Step = 'email' | 'code';

export default function EsqueciSenhaPage() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      // A API responde sempre a mesma coisa (não revela se o email existe).
      toast.success('Se o email estiver cadastrado, enviamos um código.');
      setStep('code');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Não conseguimos enviar o código.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(e: FormEvent) {
    e.preventDefault();
    const next = {
      code: validateCode(code) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };
    setErrors(next);
    if (next.code || next.password) return;

    setLoading(true);
    try {
      await authApi.resetPassword({ email: email.trim(), code, password });
      toast.success('Senha redefinida! Faça login.');
      router.replace('/login');
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setErrors({
          code: err.fieldError('code'),
          password: err.fieldError('password'),
        });
      } else if (err instanceof ApiError && err.status === 400) {
        setErrors({ code: 'Código inválido ou expirado.' });
      } else {
        toast.error(
          err instanceof ApiError ? err.message : 'Não conseguimos redefinir a senha.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={step === 'email' ? 'Recuperar senha' : 'Redefinir senha'}
      subtitle={
        step === 'email'
          ? 'Enviaremos um código de 6 dígitos para o seu email.'
          : `Digite o código enviado para ${email} e escolha uma nova senha.`
      }
      footer={
        <Link href="/login" className="font-medium text-purple-600 hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {step === 'email' ? (
        <form onSubmit={requestCode} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={loading}
          />
          <Button type="submit" fullWidth loading={loading}>
            Enviar código
          </Button>
        </form>
      ) : (
        <form onSubmit={submitReset} className="space-y-4" noValidate>
          <Input
            label="Código de 6 dígitos"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            error={errors.code}
            disabled={loading}
          />
          <PasswordInput
            label="Nova senha"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint="Mínimo 8 caracteres, com maiúscula, minúscula e número."
            disabled={loading}
          />
          <Button type="submit" fullWidth loading={loading}>
            Redefinir senha
          </Button>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-center text-sm text-ink-soft hover:text-purple-600"
          >
            Não recebeu? Voltar e reenviar
          </button>
        </form>
      )}
    </AuthShell>
  );
}