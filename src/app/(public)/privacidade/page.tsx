import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidade — MindCat',
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/" className="text-sm font-medium text-purple-600 hover:underline">
        ← Voltar
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-ink">Política de Privacidade</h1>
      <p className="mt-1 text-sm text-ink-faint">Versão 1.0 · Última atualização: 19 de agosto de 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-base font-semibold text-ink">1. Quem somos</h2>
          <p className="mt-2">
            O MindCat é operado por seus fundadores (pessoa jurídica em
            constituição), responsáveis pelas decisões sobre o tratamento dos
            seus dados pessoais (o &quot;controlador&quot;), nos termos da Lei Geral de
            Proteção de Dados (Lei 13.709/2018, &quot;LGPD&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">2. A quem se aplica</h2>
          <p className="mt-2">
            O MindCat destina-se exclusivamente a maiores de 18 anos. Não
            coletamos intencionalmente dados de menores de idade.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">3. Quais dados coletamos</h2>
          <p className="mt-2">
            <strong className="text-ink">Cadastro:</strong> nome, e-mail e senha
            (armazenada apenas de forma cifrada).{' '}
            <strong className="text-ink">Uso:</strong> preferências de perfil,
            registros de humor (nível e descrição opcional), conteúdo do diário
            (criptografado) e tarefas terapêuticas.{' '}
            <strong className="text-ink">Profissionais:</strong> número e região
            do CRP, registro e-Psi e documentos enviados para validação.{' '}
            <strong className="text-ink">Técnicos:</strong> registros mínimos de
            funcionamento e segurança. Não usamos rastreamento publicitário.
          </p>
          <p className="mt-2">
            Grande parte destes dados constitui dado pessoal sensível relativo à
            saúde (LGPD art. 5º, II), tratado com as proteções reforçadas do
            art. 11.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">4. Base legal e finalidade</h2>
          <p className="mt-2">
            Tratamos os dados de cadastro para criar e proteger sua conta
            (execução de contrato). Os dados de saúde (humor, diário, tarefas) e
            o compartilhamento com o seu psicólogo têm como base o seu
            consentimento específico e destacado (art. 11, I), que você pode
            retirar a qualquer momento.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">5. O diário é privado</h2>
          <p className="mt-2">
            O conteúdo do seu diário é criptografado (AES-256), com a chave
            mantida separada do banco de dados, e protegido por uma senha
            própria, separada da senha de acesso. O seu diário nunca é
            compartilhado com o psicólogo — nem o conteúdo, nem as datas.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">6. Compartilhamento</h2>
          <p className="mt-2">
            Não vendemos seus dados. Compartilhamos apenas: com o seu psicólogo,
            quando você ativa o consentimento (limitado a humor e progresso de
            tarefas — nunca o diário); com prestadores que operam a
            infraestrutura (seção 7); e com autoridades, quando exigido por lei.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">7. Prestadores e transferência internacional</h2>
          <p className="mt-2">
            Utilizamos: Oracle Cloud (servidores e banco, no Brasil), Vercel
            (hospedagem da interface, nos EUA), Resend (envio de e-mails) e
            Sentry (monitoramento de erros, nos EUA). Vercel e Sentry implicam
            transferência internacional de dados; o monitoramento de erros é
            configurado para não enviar conteúdo, e-mail, cookies ou
            geolocalização.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">8. Por quanto tempo guardamos</h2>
          <p className="mt-2">
            Seus dados de conta e conteúdo enquanto a conta existir. Ao excluir a
            conta, o diário e os registros de humor são apagados definitivamente,
            a conta é anonimizada e os documentos de credencial são removidos.
            Códigos temporários (2FA, recuperação de senha) expiram em minutos.
            Cópias de segurança são retidas por até 7 dias; registros técnicos,
            até 14 dias.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">9. Segurança</h2>
          <p className="mt-2">
            Criptografia do diário, senhas armazenadas apenas como hash,
            verificação em duas etapas opcional, conexão criptografada (HTTPS) e
            controle de acesso: o psicólogo só vê pacientes vinculados que
            consentiram.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">10. Seus direitos</h2>
          <p className="mt-2">
            Você pode confirmar a existência de tratamento, acessar e corrigir
            seus dados, solicitar a exclusão, exportar seus dados
            (portabilidade) e retirar o consentimento de compartilhamento. Para
            exercer esses direitos, escreva para{' '}
            <a href="mailto:privacidade@mindcat.com.br" className="font-medium text-purple-600 hover:underline">
              privacidade@mindcat.com.br
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">11. Cookies</h2>
          <p className="mt-2">
            Usamos apenas um cookie essencial, necessário para manter você
            autenticado com segurança. Não usamos cookies de publicidade ou
            rastreamento de terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">12. Contato</h2>
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
