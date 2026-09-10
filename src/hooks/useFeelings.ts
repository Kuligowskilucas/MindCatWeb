'use client';

import { useQuery } from '@tanstack/react-query';
import { feelingsApi } from '@/lib/api/feelings';

const FEELINGS_KEY = ['feelings'] as const;

/** Catálogo fixo (vem do seeder): staleTime alto, não precisa refetch. */
export function useFeelings() {
  return useQuery({
    queryKey: FEELINGS_KEY,
    queryFn: () => feelingsApi.list(),
    staleTime: Infinity,
  });
}
