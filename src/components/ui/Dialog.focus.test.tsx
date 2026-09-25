import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from './Dialog';

function DialogWithInput() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir diálogo
      </button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setText('');
        }}
        title="Confirmar"
      >
        <label htmlFor="confirm-field">Digite EXCLUIR</label>
        <input
          id="confirm-field"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Dialog>
    </>
  );
}

describe('Dialog — foco', () => {
  it('mantém o foco no campo enquanto se digita com um onClose inline', async () => {
    const user = userEvent.setup();
    render(<DialogWithInput />);

    await user.click(screen.getByRole('button', { name: 'Abrir diálogo' }));
    const field = screen.getByLabelText('Digite EXCLUIR');
    await user.click(field);
    await user.keyboard('EXCLUIR');

    expect(field).toHaveValue('EXCLUIR');
    expect(field).toHaveFocus();
  });

  it('devolve o foco ao botão que abriu o diálogo ao fechar pelo Cancelar', async () => {
    const user = userEvent.setup();
    render(<DialogWithInput />);

    const opener = screen.getByRole('button', { name: 'Abrir diálogo' });
    await user.click(opener);
    await user.click(screen.getByLabelText('Digite EXCLUIR'));
    await user.keyboard('EXC');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
