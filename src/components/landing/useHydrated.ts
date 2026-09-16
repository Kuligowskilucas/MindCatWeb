'use client';

import { useSyncExternalStore } from 'react';

/** Nunca emite mudança: o valor só troca do snapshot do servidor pro do cliente. */
function subscribeNever(): () => void {
  return () => {};
}

/**
 * false no HTML estático, true depois da hidratação. Usado por tudo que
 * depende de new Date(): a landing é prerenderizada no build, então o servidor
 * traria as datas do build e o cliente, as de hoje — hidratação divergente.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}
