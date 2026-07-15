'use client';

import { useId, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCreateDiaryEntry, diaryErrorMessage } from '@/hooks/useDiary';

const MAX = 50000; // espelha StoreDiaryRequest (content max:50000).

export function DiaryComposer() {
  const toast = useToast();
  const create = useCreateDiaryEntry();
  const fieldId = useId();

  const [content, setContent] = useState('');

  async function submit() {
    const text = content.trim();
    if (!text) return;
    try {
      await create.mutateAsync(text);
      toast.success('Anotação salva.');
      setContent('');
    } catch (err) {
      toast.error(diaryErrorMessage(err));
    }
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
          Escrever no diário
        </label>

        {/* Sem primitivo de Textarea no projeto: textarea estilizada com os
            mesmos tokens do Input pra manter a identidade visual. */}
        <textarea
          id={fieldId}
          rows={5}
          maxLength={MAX}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={create.isPending}
          placeholder="Escreva o que estiver sentindo. Escrever não pede a senha; reler, sim."
          className="w-full resize-y rounded-lg border border-line bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-purple-200 disabled:bg-purple-50 disabled:text-ink-faint"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-faint">
            {content.length.toLocaleString('pt-BR')}/{MAX.toLocaleString('pt-BR')}
          </span>
          <Button
            loading={create.isPending}
            disabled={!content.trim()}
            onClick={submit}
          >
            Salvar anotação
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}