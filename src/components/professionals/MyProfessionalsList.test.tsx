import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/http';
import type { LinkedProfessional } from '@/lib/api/professionals';
import { MyProfessionalsList } from './MyProfessionalsList';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  unlink: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/lib/api/professionals', () => ({
  professionalsApi: { list: mocks.list, unlink: mocks.unlink },
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ success: mocks.toastSuccess, error: mocks.toastError, toast: vi.fn() }),
}));

const ANA: LinkedProfessional = {
  id: 10,
  name: 'Ana Souza',
  badge: { verified: true, label: 'Psicólogo(a)' },
};

const BRUNO: LinkedProfessional = {
  id: 20,
  name: 'Bruno Lima',
  badge: { verified: false, label: 'Profissional' },
};

function renderList() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <MyProfessionalsList />
    </QueryClientProvider>,
  );
}

function itemOf(name: string): HTMLElement {
  return screen.getByText(name).closest('li') as HTMLElement;
}

beforeEach(() => {
  mocks.list.mockResolvedValue({ data: [ANA, BRUNO] });
  mocks.unlink.mockResolvedValue({ message: 'Vínculo removido.' });
});

describe('MyProfessionalsList — selo', () => {
  it('mostra o label com indicador de verificado quando verified é true', async () => {
    renderList();

    await screen.findByText('Ana Souza');
    const ana = itemOf('Ana Souza');
    expect(within(ana).getByText('Psicólogo(a)')).toBeInTheDocument();
    expect(within(ana).getByText('(registro verificado)')).toBeInTheDocument();
    expect(within(ana).queryByText('Registro não verificado')).not.toBeInTheDocument();
  });

  it('mostra "Registro não verificado" quando verified é false, sem o label da API', async () => {
    renderList();

    await screen.findByText('Bruno Lima');
    const bruno = itemOf('Bruno Lima');
    expect(within(bruno).getByText('Registro não verificado')).toBeInTheDocument();
    expect(within(bruno).queryByText('Profissional')).not.toBeInTheDocument();
    expect(within(bruno).queryByText('(registro verificado)')).not.toBeInTheDocument();
  });

  it('mostra o estado vazio com caminho para o convite', async () => {
    mocks.list.mockResolvedValue({ data: [] });
    renderList();

    expect(await screen.findByText('Nenhum profissional vinculado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para o convite' })).toHaveAttribute('href', '/perfil');
  });
});

describe('MyProfessionalsList — desvínculo', () => {
  it('confirma explicando que o profissional deixa de ver os dados e desvincula', async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByRole('button', { name: 'Desvincular Ana Souza' }));

    const dialog = screen.getByRole('dialog', { name: 'Desvincular Ana Souza?' });
    expect(within(dialog).getByText(/deixa de ver seus dados no MindCat/)).toBeInTheDocument();
    expect(mocks.unlink).not.toHaveBeenCalled();

    mocks.list.mockResolvedValue({ data: [BRUNO] });
    await user.click(within(dialog).getByRole('button', { name: 'Desvincular' }));

    expect(mocks.unlink).toHaveBeenCalledWith(10);
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Ana Souza foi desvinculado(a).');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('Ana Souza')).not.toBeInTheDocument());
    expect(mocks.list).toHaveBeenCalledTimes(2);
  });

  it('cancelar não desvincula', async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByRole('button', { name: 'Desvincular Bruno Lima' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(mocks.unlink).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('avisa quando o vínculo já não está ativo (404) e mantém o diálogo aberto', async () => {
    mocks.unlink.mockRejectedValueOnce(new ApiError(404, 'Vínculo não encontrado.'));
    const user = userEvent.setup();
    renderList();

    await user.click(await screen.findByRole('button', { name: 'Desvincular Bruno Lima' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Desvincular' }));

    expect(mocks.unlink).toHaveBeenCalledWith(20);
    expect(mocks.toastError).toHaveBeenCalledWith('Esse vínculo já não está ativo.');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
