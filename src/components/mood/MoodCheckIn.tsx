'use client';

import { useId, useState } from 'react';
import { MoodScale } from './MoodScale';
import { FeelingPicker } from './FeelingPicker';
import { TodayMoodList } from './TodayMoodList';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useCreateMood, useTodayMoods, moodErrorMessage } from '@/hooks/useMoods';
import { useFeelings } from '@/hooks/useFeelings';
import { cn } from '@/lib/cn';
import type { MoodLevel } from '@/lib/types';

const SHARED_WITH_PRO_NOTICE =
  'Seu humor, os sentimentos marcados, o pensamento e o comportamento ficam visíveis para o profissional vinculado a você. Seu diário nunca é compartilhado.';

// Espelha StoreMoodRequest (thought e behavior max:1000).
const MAX_TEXT = 1000;

type FieldName = 'mood_level' | 'feelings' | 'thought' | 'behavior';
type FieldErrors = Partial<Record<FieldName, string>>;

export function MoodCheckIn() {
  // TODOS os hooks no topo, antes de qualquer return condicional — senão a
  // ordem dos hooks muda entre renders e o React quebra (Rules of Hooks).
  const { todayMoods, isLoading } = useTodayMoods();
  const { data: feelings } = useFeelings();
  const createMood = useCreateMood();
  const toast = useToast();

  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [thought, setThought] = useState('');
  const [behavior, setBehavior] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const feelingsErrorId = useId();

  function clearError(field: FieldName) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function validate(): FieldErrors {
    const found: FieldErrors = {};

    if (!selected) found.mood_level = 'Escolha como você está se sentindo.';
    if (selectedFeelings.length === 0) found.feelings = 'Selecione ao menos um sentimento.';
    if (!thought.trim()) found.thought = 'Escreva o que você estava pensando.';
    if (!behavior.trim()) found.behavior = 'Escreva o que você fez.';

    return found;
  }

  async function submit() {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !selected) return;

    try {
      await createMood.mutateAsync({
        mood_level: selected,
        feelings: selectedFeelings,
        thought: thought.trim(),
        behavior: behavior.trim(),
      });
      toast.success('Registro salvo. Cuide-se hoje.');
      setSelected(null);
      setSelectedFeelings([]);
      setThought('');
      setBehavior('');
      setErrors({});
    } catch (err) {
      toast.error(moodErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="py-6">
          <h2 className="mb-5 text-center text-base font-semibold text-ink">
            Como você está se sentindo agora?
          </h2>

          <MoodScale
            value={selected}
            onChange={(level) => {
              setSelected(level);
              clearError('mood_level');
            }}
            disabled={createMood.isPending}
          />

          {errors.mood_level && (
            <p role="alert" className="mt-2 text-center text-sm text-danger">
              {errors.mood_level}
            </p>
          )}

          <div className="mt-6 space-y-4">
            {feelings && feelings.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-medium text-ink">O que você sentiu?</p>
                <div aria-describedby={errors.feelings ? feelingsErrorId : undefined}>
                  <FeelingPicker
                    feelings={feelings}
                    selected={selectedFeelings}
                    onChange={(slugs) => {
                      setSelectedFeelings(slugs);
                      clearError('feelings');
                    }}
                    disabled={createMood.isPending}
                  />
                </div>
                {errors.feelings && (
                  <p id={feelingsErrorId} role="alert" className="mt-1.5 text-sm text-danger">
                    {errors.feelings}
                  </p>
                )}
              </div>
            )}

            <MoodTextarea
              label="O que você estava pensando?"
              placeholder="O pensamento que passou pela sua cabeça nessa situação…"
              value={thought}
              error={errors.thought}
              disabled={createMood.isPending}
              onChange={(value) => {
                setThought(value);
                clearError('thought');
              }}
            />

            <MoodTextarea
              label="O que você fez?"
              placeholder="Como você reagiu, o que fez em seguida…"
              value={behavior}
              error={errors.behavior}
              disabled={createMood.isPending}
              onChange={(value) => {
                setBehavior(value);
                clearError('behavior');
              }}
            />

            <p className="text-xs text-ink-faint">{SHARED_WITH_PRO_NOTICE}</p>

            <Button fullWidth loading={createMood.isPending} onClick={submit}>
              Registrar
            </Button>
          </div>
        </CardBody>
      </Card>

      <TodayMoodList moods={todayMoods} isLoading={isLoading} />
    </div>
  );
}

interface MoodTextareaProps {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

/* Sem primitivo de Textarea no projeto: textarea estilizada com os mesmos
   tokens do Input, incluindo a ligação do erro por aria-describedby. */
function MoodTextarea({ label, placeholder, value, error, disabled, onChange }: MoodTextareaProps) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        maxLength={MAX_TEXT}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full resize-y rounded-lg border bg-surface px-3.5 py-3 text-sm text-ink',
          'placeholder:text-ink-faint transition-colors disabled:bg-purple-50 disabled:text-ink-faint',
          error ? 'border-danger' : 'border-line hover:border-purple-200',
        )}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
