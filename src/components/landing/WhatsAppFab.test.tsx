import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { WhatsAppFab } from './WhatsAppFab';

const HREF = 'https://wa.me/5541997696781?text=Oi%21';

function setDocumentHeight(height: number) {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: height,
    configurable: true,
  });
}

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true });
  fireEvent.scroll(window);
}

/** jsdom não tem IntersectionObserver; o stub guarda o callback pra disparar na mão. */
function stubIntersectionObserver() {
  const callbacks: ((entries: { isIntersecting: boolean }[]) => void)[] = [];

  class FakeObserver {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
      callbacks.push(callback);
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  }

  vi.stubGlobal('IntersectionObserver', FakeObserver);

  return {
    enter: () => act(() => callbacks.forEach((cb) => cb([{ isIntersecting: true }]))),
  };
}

beforeEach(() => {
  setDocumentHeight(5000);
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.querySelector('footer')?.remove();
});

describe('WhatsAppFab', () => {
  it('não renderiza antes de a pessoa rolar', () => {
    render(<WhatsAppFab href={HREF} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('continua fora da tela antes dos 60% do documento', () => {
    render(<WhatsAppFab href={HREF} />);

    scrollTo(2999); // 59.98% de 5000

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('aparece depois de passar dos 60% do documento', async () => {
    render(<WhatsAppFab href={HREF} />);

    scrollTo(3100);

    const link = await screen.findByRole('link', { name: 'Conversar com o MindCat no WhatsApp' });
    expect(link).toBeInTheDocument();
    // Sobe a opacidade no frame seguinte, pra transição ter de onde sair.
    await waitFor(() => expect(link).toHaveClass('opacity-100'));
  });

  it('abre o WhatsApp em outra aba, sem passar referrer', async () => {
    render(<WhatsAppFab href={HREF} />);

    scrollTo(3100);

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', HREF);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('some quando o rodapé entra na tela', async () => {
    const observer = stubIntersectionObserver();
    document.body.appendChild(document.createElement('footer'));

    render(<WhatsAppFab href={HREF} />);
    scrollTo(3100);
    expect(await screen.findByRole('link')).toBeInTheDocument();

    observer.enter();

    await waitFor(() => expect(screen.queryByRole('link')).not.toBeInTheDocument());
  });

  it('volta a esconder quando a pessoa rola de volta pro topo', async () => {
    render(<WhatsAppFab href={HREF} />);

    scrollTo(3100);
    expect(await screen.findByRole('link')).toBeInTheDocument();

    scrollTo(0);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
