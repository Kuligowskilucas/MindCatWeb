'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useDiary';
import { DiaryGate } from '@/components/diary/DiaryGate';
import { DiaryComposer } from '@/components/diary/DiaryComposer';
import { DiaryReader } from '@/components/diary/DiaryReader';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardBody } from '@/components/ui/Card';

export default function DiarioPage() {
  const { data: profile, isLoading, isError } = useProfile();
  const queryClient = useQueryClient();

  // A senha destravada vive só aqui, em memória. Sai da tela = some.
  const [password, setPassword] = useState<string | null>(null);

  // Ao desmontar a página (trocar de aba/rota), apaga as entradas do cache
  // pra o conteúdo do diário não ficar em memória depois de sair.
  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['diary', 'entries'] });
    };
  }, [queryClient]);

  function lock() {
    setPassword(null);
    queryClient.removeQueries({ queryKey: ['diary', 'entries'] });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Diário</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Um espaço seu, protegido por uma senha separada da conta.
          </p>
        </div>
        {password && (
          <Button variant="secondary" size="sm" onClick={lock}>
            Trancar
          </Button>
        )}
      </header>

      {isLoading ? (
        <Card>
          <CardBody className="flex justify-center py-10">
            <Spinner label="Carregando o diário" />
          </CardBody>
        </Card>
      ) : isError || !profile ? (
        <Card>
          <CardBody className="py-8 text-center text-sm text-danger">
            Não foi possível carregar o diário. Tente novamente em instantes.
          </CardBody>
        </Card>
      ) : !password ? (
        <DiaryGate
          hasPassword={profile.has_diary_password}
          onUnlocked={setPassword}
        />
      ) : (
        <>
          <DiaryComposer />
          <DiaryReader password={password} />
        </>
      )}
    </div>
  );
}