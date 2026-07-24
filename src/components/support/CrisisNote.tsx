import Link from 'next/link';
import { cn } from '@/lib/cn';

export function CrisisNote({ className }: { className?: string }) {
  return (
    <p className={cn('border-t border-line pt-4 text-xs leading-relaxed text-ink-faint', className)} >
      O MindCat não é um serviço de emergência e ninguém acompanha seus
      registros em tempo real. Se você precisa falar com alguém agora, o CVV
      atende no{' '}
      <a href="tel:188" className="font-medium text-ink-soft underline underline-offset-2 transition-colors hover:text-purple-600">
        188
      </a>
      {' '}— 24 horas, gratuito e sigiloso.{' '}
      <Link href="/ajuda" className="underline underline-offset-2 transition-colors hover:text-purple-600">
        Outros contatos
      </Link>
      .
    </p>
  );
}