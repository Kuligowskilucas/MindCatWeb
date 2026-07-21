import type { Metadata } from 'next';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import Image from 'next/image';



const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MindCat — cuidado que continua entre uma sessão e outra',
  description:
    'Acompanhe seu humor, guarde seu diário e siga as tarefas combinadas com seu psicólogo. Todos os dias, não só na consulta.',
  openGraph: {
    title: 'MindCat',
    description: 'Cuidado contínuo entre uma sessão e outra.',
    type: 'website',
    locale: 'pt_BR',
  },
};


const ctaPrimary =
  'inline-flex h-12 items-center justify-center rounded-lg bg-purple-400 px-6 ' +
  'text-base font-medium text-white transition-colors hover:bg-purple-500 active:bg-purple-600';
const ctaSecondary =
  'inline-flex h-12 items-center justify-center rounded-lg border border-purple-200 bg-white px-6 ' +
  'text-base font-medium text-purple-600 transition-colors hover:bg-purple-50 active:bg-purple-100';

type Mood = 1 | 2 | 3 | 4 | 5;


function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2">
      <Image src="/icone.png" alt="" width={24} height={24} className="h-6 w-6" />
      <span className="text-lg font-semibold tracking-tight text-ink">MindCat</span>
    </span>
  );
}

function IconMood() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M5 8 L7 4 L10 7.5 Z" strokeLinejoin="round" />
      <path d="M19 8 L17 4 L14 7.5 Z" strokeLinejoin="round" />
      <circle cx="12" cy="14" r="7.5" />
      <path d="M9.5 13.5 h.01 M14.5 13.5 h.01" strokeLinecap="round" />
      <path d="M9.5 16.5 Q12 18.5 14.5 16.5" strokeLinecap="round" />
    </svg>
  );
}
function IconDiary() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3 v18" />
      <path d="M12.5 11.5 a1.7 1.7 0 1 1 3 0 v1.2 h-3 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconTask() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8.5 12 l2.3 2.3 L15.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PATIENT_FEATURES = [
  {
    icon: <IconMood />,
    title: 'Seu humor em cinco gatos',
    body: 'Marque como foi o dia com um toque, sem transformar sentimento em nota. As cores acompanham o clima e não punem os dias mais pesados.',
  },
  {
    icon: <IconDiary />,
    title: 'Um diário só seu',
    body: 'Escreva o que quiser, protegido por uma senha própria, separada do login. Nem quem cuida de você entra sem permissão.',
  },
  {
    icon: <IconTask />,
    title: 'Tarefas que seguem com você',
    body: 'O que foi combinado na sessão vira lembrete gentil ao longo da semana — e o cuidado não para na porta do consultório.',
  },
];

const TRUST = [
  {
    title: 'Uma senha só pro diário',
    body: 'O diário tem uma autenticação própria, separada do seu acesso à conta.',
  },
  {
    title: 'Você decide quem acompanha',
    body: 'O vínculo com um profissional só acontece com o seu consentimento.',
  },
  {
    title: 'Seus dados, suas regras',
    body: 'Você pode apagar sua conta e seus registros quando quiser.',
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (prefers-reduced-motion: no-preference){
              .rise{opacity:0;transform:translateY(12px);animation:mc-rise .7s cubic-bezier(.2,.7,.2,1) forwards}
              .d1{animation-delay:.06s}.d2{animation-delay:.16s}.d3{animation-delay:.26s}.d4{animation-delay:.36s}
            }
            @keyframes mc-rise{to{opacity:1;transform:none}}
          `,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[860px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, var(--color-purple-100), transparent 70%), radial-gradient(closest-side, var(--color-sky-100), transparent 75%)',
        }}
      />

      {/* header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
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
            className="rounded-lg bg-purple-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-3xl px-6 pt-14 pb-8 text-center sm:pt-20">
        <p className="rise d1 mx-auto mb-5 w-fit rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-soft">
          Cuidado contínuo em saúde mental
        </p>
        <h1
          className={`rise d1 text-balance text-4xl leading-[1.1] tracking-tight text-ink sm:text-5xl ${fraunces.className}`}
        >
          O cuidado não precisa parar entre uma sessão e outra.
        </h1>
        <p className="rise d2 mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          O MindCat acompanha seu humor, guarda seu diário e organiza as tarefas
          combinadas com seu psicólogo — todos os dias, não só na consulta.
        </p>
        <div className="rise d3 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/registro" className={ctaPrimary}>
            Criar conta
          </Link>
          <Link href="#para-profissionais" className={ctaSecondary}>
            Sou psicólogo(a)
          </Link>
        </div>
        <p className="rise d3 mt-3 text-sm text-ink-faint">Grátis durante o lançamento.</p>

        {/* assinatura: a régua dos cinco gatos */}
        <div className="rise d4 mt-14">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-2 sm:gap-3">
            {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
              <div key={m} className="flex aspect-square items-center justify-center rounded-card bg-surface border border-line">
                <Image src={`/humor/mood-${m}.png`} alt="" width={72} height={72} className="h-3/5 w-3/5 object-contain"/>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm text-ink-faint">
            Registre como você está com um toque. Sem notas de 0 a 10 — um dia
            difícil não é um alarme vermelho.
          </p>
        </div>
      </section>

      {/* features do paciente */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {PATIENT_FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-card border border-line bg-surface p-6 shadow-card"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                {f.icon}
              </div>
              <h3 className={`text-lg text-ink ${fraunces.className}`}>{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* seção profissional */}
      <section id="para-profissionais" className="mx-auto max-w-6xl px-6 pb-20">
        <div
          className="overflow-hidden rounded-card border border-line p-8 sm:p-12"
          style={{
            background:
              'linear-gradient(135deg, var(--color-purple-50), var(--color-sky-100))',
          }}
        >
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-medium text-purple-600">Para psicólogos(as)</p>
            <h2 className={`text-3xl leading-tight tracking-tight text-ink ${fraunces.className}`}>
              Acompanhe seus pacientes entre as sessões.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Veja a evolução do humor ao longo do tempo, combine tarefas e
              acompanhe um resumo clínico de cada paciente — sem invadir o
              diário, que continua privado. O consultório ganha continuidade nos
              dias entre uma consulta e outra.
            </p>
            <p className="mt-4 rounded-xl border border-purple-200/60 bg-white/60 p-4 text-sm text-ink-soft">
              O acesso profissional passa por uma validação do seu registro
              (CRP) antes de liberar os atendimentos. Você cria a conta, envia os
              comprovantes e nossa equipe confirma o cadastro.
            </p>
            <div className="mt-7">
              <Link href="/registro" className={ctaPrimary}>
                Quero atender no MindCat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* confiança / privacidade */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className={`text-center text-2xl tracking-tight text-ink ${fraunces.className}`}>
          Seus dados são seus.
        </h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-5 sm:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t.title} className="text-center sm:text-left">
              <h3 className="text-base font-semibold text-ink">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className={`text-3xl tracking-tight text-ink ${fraunces.className}`}>
          Comece a cuidar hoje.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Criar sua conta leva um minuto. O primeiro registro de humor pode ser
          agora mesmo.
        </p>
        <div className="mt-7">
          <Link href="/registro" className={ctaPrimary}>
            Criar conta
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Wordmark />
          <p className="text-sm text-ink-faint">
            Cuidado contínuo entre uma sessão e outra.
          </p>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-ink-soft transition-colors hover:text-purple-600">
              Entrar
            </Link>
            <Link href="/registro" className="text-ink-soft transition-colors hover:text-purple-600">
              Criar conta
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}