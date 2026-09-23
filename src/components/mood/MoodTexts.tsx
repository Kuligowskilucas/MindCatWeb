interface MoodTextsProps {
  thought: string | null;
  behavior: string | null;
}

const EMPTY = 'Não informado';

/**
 * Pensamento e comportamento, um abaixo do outro. Os dois são nullable no
 * banco (registro anterior à migration), então o vazio vira texto apagado —
 * o item mantém a mesma altura em vez de encolher e sumir com o rótulo.
 */
export function MoodTexts({ thought, behavior }: MoodTextsProps) {
  return (
    <dl className="mt-3 space-y-2">
      <MoodText label="Pensamento" value={thought} />
      <MoodText label="Comportamento" value={behavior} />
    </dl>
  );
}

function MoodText({ label, value }: { label: string; value: string | null }) {
  const filled = Boolean(value?.trim());

  return (
    <div>
      <dt className="text-xs font-medium text-ink-soft">{label}</dt>
      <dd className={filled ? 'text-sm text-ink' : 'text-sm text-ink-faint'}>
        {filled ? value : EMPTY}
      </dd>
    </div>
  );
}
