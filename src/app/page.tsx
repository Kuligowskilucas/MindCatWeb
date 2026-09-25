import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Fraunces } from 'next/font/google';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { MoodDemo } from '@/components/landing/MoodDemo';
import { MoodChartPreview } from '@/components/landing/MoodChartPreview';
import { CompletedTaskDate } from '@/components/landing/CompletedTaskDate';
import { InstagramIcon, WhatsAppIcon } from '@/components/icons';
import type { MoodLevel } from '@/lib/types';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MindCat — registro de humor, diário e tarefas do terapeuta',
  description:
    'Marque como foi o dia em um toque, guarde seu diário com senha própria e acompanhe as tarefas combinadas na sessão.',
  openGraph: {
    title: 'MindCat',
    description: 'Registro de humor, diário com senha própria e tarefas do terapeuta.',
    type: 'website',
    locale: 'pt_BR',
  },
};

const INSTAGRAM_URL = 'https://www.instagram.com/_mindcat/';
const WHATSAPP_NUMBER = '5541997696781';
const WHATSAPP_MESSAGE = 'Oi! Vim pelo site do MindCat.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const ctaPrimary =
  'inline-flex h-12 items-center justify-center rounded-lg bg-purple-600 px-6 ' +
  'text-base font-medium text-white transition-colors hover:bg-purple-700 active:bg-purple-700';
const ctaSecondary =
  'inline-flex h-12 items-center justify-center rounded-lg border border-purple-200 bg-surface px-6 ' +
  'text-base font-medium text-purple-600 transition-colors hover:bg-purple-50 active:bg-purple-100';

/**
 * As figuras abaixo imitam botões e campos do app com span e div. Um botão de
 * verdade dentro de uma figura inerte só serviria pra confundir quem navega
 * por teclado ou leitor de tela.
 */
const fakeButtonPrimary =
  'flex h-11 w-full items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-medium text-white';
const fakeButtonSecondary =
  'flex h-9 shrink-0 items-center justify-center rounded-lg border border-purple-200 bg-surface px-3 text-sm font-medium text-purple-600';

const WEEK_LEVELS: (MoodLevel | null)[] = [3, 2, null, 3, 4, 4, 5];

const MONTH_LEVELS: (MoodLevel | null)[] = [
  2, 3, null, 3, 2, 2, 3, 4, 3, null,
  3, 3, 4, 4, 3, 2, 3, 4, 4, 5,
  4, 3, null, 3, 4, 4, 5, 4, 4, 5,
];

const PENDING_TASKS = [
  'Anotar três situações que geraram ansiedade',
  'Caminhar 20 minutos, três vezes na semana',
];

const FEELING_FREQUENCY = [
  { label: 'Ansioso', count: 9 },
  { label: 'Cansado', count: 7 },
  { label: 'Calmo', count: 4 },
];

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2">
      <Image src="/icone.png" alt="" width={24} height={24} className="h-6 w-6" />
      <span className="text-lg font-semibold tracking-tight text-ink">MindCat</span>
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{children}</h2>
  );
}

function ScreenFigure({ children }: { children: React.ReactNode }) {
  return (
    <div inert aria-hidden="true" className="select-none">
      {children}
    </div>
  );
}

function MoodScreen() {
  return (
    <ScreenFigure>
      <Card>
        <CardHeader
          title="Seu humor no período"
          description="Os últimos 7 dias"
          action={
            <div className="flex gap-1 rounded-lg border border-line p-1">
              <span className="rounded-md bg-purple-600 px-2.5 py-1 text-xs font-medium text-white">
                7 dias
              </span>
              <span className="rounded-md px-2.5 py-1 text-xs font-medium text-ink-soft">
                30 dias
              </span>
            </div>
          }
        />
        <CardBody>
          <MoodChartPreview levels={WEEK_LEVELS} days={7} />
        </CardBody>
      </Card>
    </ScreenFigure>
  );
}

function DiaryScreen() {
  return (
    <ScreenFigure>
      <Card>
        <CardHeader
          title="Diário trancado"
          description="Digite a senha do diário para ler e escrever."
        />
        <CardBody className="space-y-4">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Senha do diário</span>
            <div className="flex h-11 items-center justify-end rounded-lg border border-line bg-surface px-3.5">
              <span className="text-xs font-medium text-ink-soft">mostrar</span>
            </div>
          </div>
          <span className={fakeButtonPrimary}>Destravar</span>
        </CardBody>
      </Card>
    </ScreenFigure>
  );
}

function TasksScreen() {
  return (
    <ScreenFigure>
      <div className="space-y-4">
        <Card>
          <CardHeader title="A fazer" description="2 pendentes" />
          <CardBody className="space-y-3">
            {PENDING_TASKS.map((title) => (
              <div
                key={title}
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas px-4 py-3"
              >
                <span className="min-w-0 text-sm text-ink">{title}</span>
                <span className={fakeButtonSecondary}>Marcar como feita</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Concluídas" description="1 no total" />
          <CardBody>
            <div className="flex items-start justify-between gap-3 rounded-lg border border-line px-4 py-3">
              <span className="min-w-0 text-sm text-ink-soft line-through">
                Registrar o humor todo dia por uma semana
              </span>
              <CompletedTaskDate daysAgo={14} />
            </div>
          </CardBody>
        </Card>
      </div>
    </ScreenFigure>
  );
}

function ClinicalSummaryScreen() {
  return (
    <ScreenFigure>
      <Card>
        <CardHeader title="Humor no período" description="Últimos 30 dias" />
        <CardBody className="space-y-6">
          <MoodChartPreview levels={MONTH_LEVELS} days={30} showLevelLabels />

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Sentimentos mais frequentes</p>
            <ul className="flex flex-wrap gap-2">
              {FEELING_FREQUENCY.map((feeling) => (
                <li
                  key={feeling.label}
                  className="flex items-center gap-1.5 rounded-full border border-purple-600 bg-purple-600 px-3.5 py-1.5 text-sm font-medium text-white"
                >
                  <span>{feeling.label}</span>
                  <span className="text-xs font-semibold text-white/80">{feeling.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Registros recentes</p>
            <div className="rounded-lg border border-line p-3">
              <div className="flex items-center justify-between gap-3">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium text-ink"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-mood-2) 18%, white)',
                  }}
                >
                  Triste
                </span>
                <span className="text-xs text-ink-soft">14/09</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Cansado', 'Ansioso'].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-purple-600 bg-purple-600 px-3.5 py-1.5 text-sm font-medium text-white"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                “Semana pesada no trabalho, dormi mal.”
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </ScreenFigure>
  );
}

export default function Home() {
  return (
    <div>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Wordmark />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-purple-50 hover:text-purple-600"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-10 pb-16 sm:pt-16">
        <h1
          className={`max-w-3xl text-balance text-4xl leading-[1.12] tracking-tight text-ink sm:text-5xl ${fraunces.className}`}
        >
          Um toque por dia vira o histórico que seu terapeuta lê.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          Marque como foi o dia, escreva no diário e acompanhe as tarefas combinadas na
          sessão.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/registro" className={ctaPrimary}>
            Criar conta
          </Link>
          <Link href="#para-profissionais" className={ctaSecondary}>
            Sou terapeuta
          </Link>
          <span className="text-sm text-ink-soft sm:ml-2">Grátis durante o lançamento.</span>
        </div>

        <div className="mt-12">
          <MoodDemo />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <SectionTitle>Cinco gatos, um registro por dia</SectionTitle>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Você escolhe o gato do dia, marca os sentimentos que apareceram e pode anotar
              uma frase sobre o que pesou. Vale um registro por dia.
            </p>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Na tela inicial esses registros viram gráfico de 7 ou 30 dias. Dia sem
              registro fica em branco no gráfico.
            </p>
          </div>
          <MoodScreen />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="md:order-2">
            <SectionTitle>O diário tem senha própria</SectionTitle>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              A senha do diário é separada da senha da conta. Ela é pedida a cada leitura, a
              cada anotação e a cada exclusão.
            </p>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Ao sair da tela o diário tranca de novo, e o conteúdo sai da memória do
              navegador. No banco, o texto fica cifrado.
            </p>
          </div>
          <div className="md:order-1">
            <DiaryScreen />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <SectionTitle>As tarefas vêm do seu terapeuta</SectionTitle>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Seu terapeuta escreve a tarefa no app dele e ela aparece na sua lista, em “A
              fazer”.
            </p>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">
              Quando terminar, você toca em “Marcar como feita” e ela passa para
              “Concluídas”, com a data. O resumo que ele lê mostra quantas você concluiu.
            </p>
          </div>
          <TasksScreen />
        </div>
      </section>

      <section id="para-profissionais" className="mt-10 border-y border-line bg-purple-50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-medium text-purple-600">Para terapeutas</p>
            <h2
              className={`text-3xl leading-tight tracking-tight text-ink sm:text-4xl ${fraunces.className}`}
            >
              O que você vê do seu paciente
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Com o consentimento do paciente, você vê o gráfico de humor dos últimos 30
              dias, os sentimentos mais marcados, cada registro com a anotação que ele
              escreveu e quantos exercícios foram concluídos. O diário não aparece pra você
              em nenhuma tela. Se o paciente revogar o consentimento, o resumo deixa de
              aparecer na hora.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              O vínculo começa pelo paciente: ele gera um código no app dele e passa para
              você, que adiciona em Pacientes.
            </p>
            <p className="mt-6 rounded-card border border-purple-200 bg-surface p-4 text-base leading-relaxed text-ink-soft">
              Psicólogos e psiquiatras podem verificar o registro no conselho (CRP ou CRM).
              Você envia os comprovantes, nossa equipe confirma e seus pacientes passam a ver
              o selo de profissional verificado. A verificação é opcional e não trava seus
              atendimentos.
            </p>
          </div>

          <div className="mt-12">
            <ClinicalSummaryScreen />
          </div>

          <div className="mt-10">
            <Link href="/registro" className={ctaPrimary}>
              Quero atender no MindCat
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <SectionTitle>Privacidade, em termos concretos</SectionTitle>
        <p className="mt-5 text-base leading-relaxed text-ink-soft">
          O diário tem autenticação própria: uma senha separada da conta, exigida a cada
          leitura e a cada anotação. Nenhuma tela do app mostra seu diário a terapeutas ou à
          equipe.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          O vínculo com um profissional depende do seu consentimento. Você gera o código de
          convite, liga o compartilhamento no seu perfil e desliga quando quiser; a partir
          daí o profissional perde o acesso ao seu resumo.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          A exclusão da conta fica no seu perfil, atrás de uma confirmação digitada. Ao
          confirmar, o diário e os registros de humor são apagados. O passo a passo está na{' '}
          <Link href="/ajuda" className="font-medium text-purple-600 underline underline-offset-2">
            Ajuda
          </Link>
          .
        </p>
        <div className="mt-8">
          <Link href="/registro" className={ctaPrimary}>
            Criar conta
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <SectionTitle>Fale com a gente</SectionTitle>
        <p className="mt-5 text-base leading-relaxed text-ink-soft">
          Dúvida sobre o app, sugestão ou vontade de entender se o MindCat serve pra você?
          Chame por onde preferir.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ctaSecondary} gap-2`}
          >
            <InstagramIcon aria-hidden="true" />
            Instagram
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ctaSecondary} gap-2`}
          >
            <WhatsAppIcon aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Wordmark />
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <Link href="/login" className="text-ink-soft transition-colors hover:text-purple-600">
              Entrar
            </Link>
            <Link href="/registro" className="text-ink-soft transition-colors hover:text-purple-600">
              Criar conta
            </Link>
            <Link href="/ajuda" className="text-ink-soft transition-colors hover:text-purple-600">
              Ajuda
            </Link>
            <Link href="/privacidade" className="text-ink-soft transition-colors hover:text-purple-600">
              Privacidade
            </Link>
            <Link href="/termos" className="text-ink-soft transition-colors hover:text-purple-600">
              Termos
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
