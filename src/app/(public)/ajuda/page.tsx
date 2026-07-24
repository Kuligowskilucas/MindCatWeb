import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Ajuda em momentos difíceis — MindCat',
  description:
    'Contatos de apoio emocional e de emergência no Brasil. O MindCat não é um serviço de emergência.',
};

interface Resource {
  name: string;
  contact: string;
  tel?: string;
  detail: string;
  extra?: string;
}

const RESOURCES: Resource[] = [
  {
    name: 'CVV — Centro de Valorização da Vida',
    contact: '188',
    tel: '188',
    detail:
      'Apoio emocional e prevenção do suicídio, 24 horas por dia, todos os dias. A ligação é gratuita de todo o país e o atendimento é feito por voluntários, com sigilo e anonimato.',
    extra: 'Também atende por chat e e-mail em cvv.org.br.',
  },
  {
    name: 'SAMU',
    contact: '192',
    tel: '192',
    detail:
      'Emergência médica. Chame se houver risco imediato à vida, ferimento grave ou intoxicação.',
  },
  {
    name: 'Bombeiros',
    contact: '193',
    tel: '193',
    detail:
      'Resgate e emergência. Em boa parte do país também atende ocorrências de urgência médica.',
  },
];

export default function AjudaPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/icone.png" alt="" width={24} height={24} className="h-6 w-6" />
            <span className="text-lg font-semibold tracking-tight text-ink">MindCat</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Se você precisa de ajuda agora
        </h1>

        <div className="mt-6 rounded-card border border-line border-l-4 border-l-warning bg-surface px-5 py-4 shadow-card">
          <p className="text-sm font-semibold text-ink">
            O MindCat não é um serviço de emergência.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Nada do que você escreve aqui aciona atendimento. Ninguém lê seus
            registros em tempo real — nem a nossa equipe, nem o psicólogo
            vinculado à sua conta, que vê o que você registrou apenas quando
            abre o painel dele. Se a situação é urgente, use um dos contatos
            abaixo.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {RESOURCES.map((r) => (
            <div key={r.name} className="rounded-card border border-line bg-surface px-5 py-4 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-base font-semibold text-ink">{r.name}</h2>
                {r.tel ? (
                  <a
                    href={`tel:${r.tel}`}
                    className="text-2xl font-semibold tracking-tight text-purple-600 underline-offset-4 hover:underline"
                  >
                    {r.contact}
                  </a>
                ) : (
                  <span className="text-2xl font-semibold tracking-tight text-ink">
                    {r.contact}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.detail}</p>
              {r.extra && (
                <p className="mt-1.5 text-sm leading-relaxed text-ink-faint">{r.extra}</p>
              )}
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Acompanhamento pela rede pública
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Os CAPS (Centros de Atenção Psicossocial) são serviços gratuitos de
            saúde mental do SUS e funcionam em regime de porta aberta: dá para
            ir direto e pedir atendimento, sem encaminhamento nem consulta
            marcada para o primeiro acolhimento. Para descobrir qual é o da sua
            região, procure a Secretaria de Saúde do seu município ou a UBS mais
            próxima de casa.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Para sofrimento leve a moderado, a própria UBS costuma ser a porta
            de entrada e pode acompanhar o caso ou encaminhar.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Procurar ajuda é uma decisão legítima
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Você não precisa estar em risco de vida para ligar para o CVV nem
            justificar por que procurou. Falar com alguém quando o dia está
            pesado é motivo suficiente.
          </p>
        </section>

        <p className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
          CVV, SAMU, Bombeiros e os CAPS são serviços independentes, sem
          qualquer vínculo com o MindCat. Os contatos estão aqui apenas como
          encaminhamento.
        </p>

        <div className="mt-8">
          <Link href="/" className="text-sm text-ink-soft underline underline-offset-2 transition-colors hover:text-purple-600">
            Voltar para o início
          </Link>
        </div>
      </main>
    </div>
  );
}