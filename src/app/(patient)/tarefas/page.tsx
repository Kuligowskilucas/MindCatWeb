import { TaskList } from '@/components/tasks/TaskList';

export default function TarefasPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Tarefas</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Atividades sugeridas pelo seu psicólogo para acompanhar entre as sessões.
        </p>
      </header>

      <TaskList />
    </div>
  );
}