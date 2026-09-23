/** YYYY-MM-DD no fuso local (não UTC — senão vira o dia errado à noite). */
export function localDayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isToday(date: Date | string): boolean {
  return localDayKey(date) === localDayKey(new Date());
}

/** Rótulo "HH:mm" no fuso local — horário do registro na lista do dia. */
export function timeOfDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Rótulo curto tipo "seg", "ter"… para o gráfico. */
export function weekdayShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
}

/** Rótulo "dd/MM" (fuso local) — eixo do gráfico quando a janela passa de uma semana. */
export function shortDayMonth(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}