'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { useDiaryEntries, useDeleteDiaryEntry, diaryErrorMessage } from '@/hooks/useDiary';
import type { DiaryEntry } from '@/lib/types';

interface DiaryReaderProps {
  /** Senha em memória; reenviada em toda leitura/exclusão. */
  password: string;
}

/** Ex.: "12 de julho de 2026, 14:03". */
function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DiaryReader({ password }: DiaryReaderProps) {
  const { data: entries, isLoading, isError, error } = useDiaryEntries(password);
  const remove = useDeleteDiaryEntry(password);
  const toast = useToast();

  // Entrada marcada para exclusão (abre o Dialog de confirmação).
  const [pending, setPending] = useState<DiaryEntry | null>(null);

  async function confirmDelete() {
    if (!pending) return;
    try {
      await remove.mutateAsync(pending.id);
      toast.success('Anotação excluída.');
      setPending(null);
    } catch (err) {
      toast.error(diaryErrorMessage(err));
      setPending(null);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center py-10">
          <Spinner label="Carregando suas anotações" />
        </CardBody>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-8 text-center text-sm text-danger">
          {diaryErrorMessage(error)}
        </CardBody>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Seu diário está vazio"
          description="Quando você escrever, suas anotações aparecem aqui, da mais recente para a mais antiga."
        />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Suas anotações"
          description={`${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'}`}
        />
        <CardBody className="space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-lg border border-line bg-canvas px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <time className="text-xs font-medium text-ink-faint">
                  {formatWhen(entry.created_at)}
                </time>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setPending(entry)}
                >
                  Excluir
                </Button>
              </div>
              {/* whitespace-pre-wrap preserva as quebras de linha do desabafo. */}
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
                {entry.content}
              </p>
            </article>
          ))}
        </CardBody>
      </Card>

      <Dialog
        open={pending !== null}
        onClose={() => !remove.isPending && setPending(null)}
        title="Excluir esta anotação?"
        description="Esta ação é definitiva — a anotação não vai para a lixeira e não dá para recuperar."
        confirmLabel="Excluir"
        confirmVariant="danger"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}