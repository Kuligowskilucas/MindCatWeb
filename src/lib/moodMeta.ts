import type { MoodLevel } from './types';

interface MoodMeta {
  level: MoodLevel;
  label: string;
  image: string;
  /** Tom suave para o card/fundo. Não é semáforo: nível 1 não é vermelho-erro. */
  tint: string;
}

export const MOOD_META: Record<MoodLevel, MoodMeta> = {
  1: { level: 1, label: 'Bravo',       image: '/humor/mood-1.png', tint: 'var(--color-mood-1)' },
  2: { level: 2, label: 'Triste',      image: '/humor/mood-2.png', tint: 'var(--color-mood-2)' },
  3: { level: 3, label: 'Normal',      image: '/humor/mood-3.png', tint: 'var(--color-mood-3)' },
  4: { level: 4, label: 'Feliz',       image: '/humor/mood-4.png', tint: 'var(--color-mood-4)' },
  5: { level: 5, label: 'Muito feliz', image: '/humor/mood-5.png', tint: 'var(--color-mood-5)' },
};

export const MOOD_LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];