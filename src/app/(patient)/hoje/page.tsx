'use client';

import { useAuth } from '@/contexts/AuthContext';
import { MoodCheckIn } from '@/components/mood/MoodCheckIn';
import { MoodWeekCard } from '@/components/mood/MoodWeekCard';

export default function HojePage() {
  const { user } = useAuth();
  const primeiroNome = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">
          Olá{primeiroNome ? `, ${primeiroNome}` : ''}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">Como está seu dia hoje?</p>
      </header>

      <MoodCheckIn />
      <MoodWeekCard />
    </div>
  );
}