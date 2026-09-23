'use client';

import { useEffect, useState } from 'react';
import { WhatsAppIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

/** Só aparece depois de 60% da altura do documento rolada. */
const SHOW_AFTER_RATIO = 0.6;

interface WhatsAppFabProps {
  href: string;
  /** Elemento que, ao entrar na tela, esconde o flutuante. */
  hideWhenVisibleSelector?: string;
}

export function WhatsAppFab({ href, hideWhenVisibleSelector = 'footer' }: WhatsAppFabProps) {
  const [pastThreshold, setPastThreshold] = useState(false);
  const [targetVisible, setTargetVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    function check() {
      const height = document.documentElement.scrollHeight;
      setPastThreshold(height > 0 && window.scrollY / height > SHOW_AFTER_RATIO);
    }

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);

    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  useEffect(() => {
    // Com o rodapé na tela o contato já está à mão; o flutuante só estorvaria.
    if (typeof IntersectionObserver === 'undefined') return;

    const target = document.querySelector(hideWhenVisibleSelector);
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => setTargetVisible(entry.isIntersecting));
    observer.observe(target);

    return () => observer.disconnect();
  }, [hideWhenVisibleSelector]);

  const visible = pastThreshold && !targetVisible;

  useEffect(() => {
    if (!visible) return;

    // Monta opaco em 0 e sobe no frame seguinte — sem isso a transição não roda,
    // porque o elemento nasce já com a opacidade final.
    const frame = requestAnimationFrame(() => setEntered(true));

    return () => {
      cancelAnimationFrame(frame);
      // Volta ao zero pra próxima aparição também entrar com transição.
      setEntered(false);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar com o MindCat no WhatsApp"
      className={cn(
        // z-40 fica abaixo do z-50 do Dialog e do Toast: o flutuante nunca cobre um aviso.
        'fixed z-40 flex h-14 w-14 items-center justify-center rounded-full',
        'bg-purple-600 text-white shadow-card',
        'hover:bg-purple-700 active:bg-purple-700',
        // motion-safe: quem pede menos movimento recebe a troca sem transição.
        'motion-safe:transition-opacity motion-safe:duration-300',
        entered ? 'opacity-100' : 'opacity-0',
      )}
      style={{
        right: 'calc(1rem + env(safe-area-inset-right))',
        bottom: 'calc(1rem + env(safe-area-inset-bottom))',
      }}
    >
      <WhatsAppIcon aria-hidden className="h-7 w-7" />
    </a>
  );
}
