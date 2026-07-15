'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MoodScale } from './MoodScale';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useCreateMood, useTodayMood, moodErrorMessage } from '@/hooks/useMoods';
import { MOOD_META } from '@/lib/moodMeta';
import { ApiError } from '@/lib/http';
import type { MoodLevel } from '@/lib/types';

export function MoodCheckIn() {
  // TODOS os hooks no topo, antes de qualquer return condicional — senão a
  // ordem dos hooks muda entre renders e o React quebra (Rules of Hooks).
  const { todayMood, isLoading } = useTodayMood();
  const createMood = useCreateMood();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState('');

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex justify-center py-10">
          <Spinner label="Carregando seu humor" />
        </CardBody>
      </Card>
    );
  }

  // Já registrou hoje: mostra o estado, não o seletor.
  if (todayMood) {
    const meta = MOOD_META[todayMood.mood_level];
    return (
      <Card>
        <CardBody className="flex flex-col items-center py-8 text-center">
          <Image src={meta.image} alt="" width={72} height={72} style={{ width: 72, height: 'auto' }} />
          <p className="mt-3 text-base font-medium text-ink">
            Hoje você está: {meta.label.toLowerCase()}
          </p>
          {todayMood.mood_description && (
            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              “{todayMood.mood_description}”
            </p>
          )}
          <p className="mt-4 text-xs text-ink-faint">
            Você já registrou seu humor de hoje. Volte amanhã.
          </p>
        </CardBody>
      </Card>
    );
  }

  async function submit() {
    if (!selected) return;
    try {
      await createMood.mutateAsync({
        mood_level: selected,
        mood_description: note.trim() || undefined,
      });
      toast.success('Humor registrado. Cuide-se hoje.');
      setSelected(null);
      setNote('');
    } catch (err) {
      toast.error(moodErrorMessage(err));
      // Se foi 409 (já registrou hoje), a lista está desatualizada:
      // recarrega pra que o card troque para o estado "já registrado".
      if (err instanceof ApiError && err.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['moods'] });
      }
    }
  }

  return (
    <Card>
      <CardBody className="py-6">
        <h2 className="mb-5 text-center text-base font-semibold text-ink">
          Como você está se sentindo hoje?
        </h2>

        <MoodScale
          value={selected}
          onChange={setSelected}
          disabled={createMood.isPending}
        />

        {selected && (
          <div className="mt-6 space-y-4">
            <Input
              label="Quer anotar algo? (opcional)"
              placeholder="O que influenciou seu humor hoje…"
              maxLength={255}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={createMood.isPending}
            />
            <Button
              fullWidth
              loading={createMood.isPending}
              onClick={submit}
            >
              Registrar humor
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}