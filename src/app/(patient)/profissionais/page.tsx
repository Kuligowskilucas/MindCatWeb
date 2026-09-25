import { MyProfessionalsList } from '@/components/professionals/MyProfessionalsList';

export default function ProfissionaisPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Meus profissionais</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Quem acompanha você no MindCat. O selo indica se o registro profissional foi verificado
          pela nossa equipe.
        </p>
      </header>

      <MyProfessionalsList />
    </div>
  );
}
