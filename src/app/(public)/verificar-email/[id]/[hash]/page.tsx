'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/http';

type Status = 'loading' | 'success' | 'error';

function VerifyEmailInner() {
  const params = useParams<{ id: string; hash: string }>();
  const search = useSearchParams();

  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const id = String(params.id);
    const hash = String(params.hash);
    const query = search.toString();

    authApi
      .verifyEmail(id, hash, query)
      .then((res) => {
        setStatus('success');
        setMessage(
          res.already_verified
            ? 'Seu e-mail já estava confirmado.'
            : 'E-mail confirmado com sucesso.',
        );
      })
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(
          err instanceof ApiError && err.status === 403
            ? 'Este link de confirmação é inválido ou expirou.'
            : 'Não conseguimos confirmar seu e-mail. Tente novamente em instantes.',
        );
      });
  }, [params.id, params.hash, search]);

  if (status === 'loading') {
    return (
      <AuthShell title="Confirmando seu e-mail">
        <p className="text-sm text-ink-soft">Um instante, estamos confirmando…</p>
      </AuthShell>
    );
  }

  if (status === 'success') {
    return (
      <AuthShell title="E-mail confirmado">
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">{message} Já pode entrar na sua conta.</p>
          <Link href="/login">
            <Button type="button" fullWidth>
              Ir para o login
            </Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Não foi possível confirmar">
      <div className="space-y-4">
        <p className="text-sm text-ink-soft">{message}</p>
        <p className="text-sm text-ink-faint">
          Você pode pedir um novo link na tela de login, na opção de reenviar
          confirmação.
        </p>
        <Link href="/login">
          <Button type="button" variant="secondary" fullWidth>
            Ir para o login
          </Button>
        </Link>
      </div>
    </AuthShell>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-ink-soft">Carregando…</div>}
    >
      <VerifyEmailInner />
    </Suspense>
  );
}