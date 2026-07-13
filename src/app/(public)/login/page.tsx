'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { user, initializing, login, logout } = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  if (initializing) return <p className="p-8">Verificando sessão…</p>;

  async function entrar() {
    setErro(null);
    setOcupado(true);
    try {
      await login('paciente@mindcat.app', 'Paciente123');
    } catch (e: any) {
      setErro(`${e.name}: ${e.message}`);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="space-y-4 p-8">
      <p className="text-sm text-ink-soft">
        Estado: <strong>{user ? 'AUTENTICADO' : 'sem sessão'}</strong>
      </p>

      <pre className="overflow-auto rounded bg-purple-50 p-4 text-xs">
        {user ? JSON.stringify(user, null, 2) : '— nenhum usuário —'}
      </pre>

      <div className="flex gap-2">
        <button
          onClick={entrar}
          disabled={ocupado}
          className="rounded bg-purple-400 px-4 py-2 text-white disabled:opacity-50"
        >
          {ocupado ? 'Entrando…' : 'Entrar como paciente'}
        </button>
        <button onClick={() => logout()} className="rounded border px-4 py-2">
          Sair
        </button>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}
    </div>
  );
}