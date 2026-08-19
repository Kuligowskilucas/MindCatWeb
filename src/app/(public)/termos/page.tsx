import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso — MindCat',
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/" className="text-sm font-medium text-purple-600 hover:underline">
        ← Voltar
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-ink">Termos de Uso</h1>
      <p className="mt-1 text-sm text-ink-faint">Versão 1.0 · Última atualização: 19 de agosto de 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-base font-semibold text-ink">1. Aceitação</h2>
          <p className="mt-2">
            Ao criar uma conta no MindCat, você concorda com estes Termos e com
            a Política de Privacidade.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">2. O que é o MindCat</h2>
          <p className="mt-2">
            O MindCat é uma ferramenta de apoio à continuidade terapêutica entre
            sessões. Ele não substitui o acompanhamento profissional presencial
            nem constitui, por si só, tratamento de saúde.
          </p>
        </section>

        <section className="rounded-lg border border-danger/30 bg-danger/5 p-4">
          <h2 className="text-base font-semibold text-ink">3. O MindCat não é um serviço de emergência</h2>
          <p className="mt-2">
            O MindCat não é um canal de atendimento de urgência ou emergência. Se
            você estiver em crise ou risco, procure ajuda imediata: CVV — 188,
            SAMU — 192, ou o serviço de emergência mais próximo.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">4. Quem pode usar</h2>
          <p className="mt-2">
            O MindCat é destinado a maiores de 18 anos. Ao se cadastrar, você
            declara ter 18 anos ou mais.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">5. Suas responsabilidades</h2>
          <p className="mt-2">
            Fornecer informações verdadeiras, manter a confidencialidade das suas
            senhas (inclusive a senha do diário) e não usar a plataforma para
            fins ilícitos.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">6. Profissionais</h2>
          <p className="mt-2">
            O psicólogo declara ser habilitado e é responsável pela veracidade da
            credencial que envia. A validação pela plataforma não substitui a
            responsabilidade profissional e ética do psicólogo perante seu
            conselho de classe.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">7. Propriedade intelectual</h2>
          <p className="mt-2">
            O conteúdo que você cria (diário, registros) é seu. A plataforma, sua
            marca e seu código pertencem ao MindCat.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">8. Limitação de responsabilidade</h2>
          <p className="mt-2">
            O MindCat é fornecido como ferramenta de apoio, sem garantia de
            resultados terapêuticos.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">9. Encerramento</h2>
          <p className="mt-2">
            Você pode encerrar sua conta a qualquer momento pela plataforma.
            Podemos suspender contas que violem estes Termos.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">10. Lei aplicável</h2>
          <p className="mt-2">Estes Termos são regidos pela lei brasileira.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">11. Contato</h2>
          <p className="mt-2">
            <a href="mailto:privacidade@mindcat.com.br" className="font-medium text-purple-600 hover:underline">
              privacidade@mindcat.com.br
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
