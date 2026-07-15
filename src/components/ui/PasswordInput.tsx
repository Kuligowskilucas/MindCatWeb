'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Input } from './Input';

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  hint?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ label, error, hint, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        label={label}
        error={error}
        hint={hint}
        type={visible ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            className="rounded px-2 py-1 text-xs font-medium text-ink-soft hover:text-purple-600"
          >
            {visible ? 'ocultar' : 'mostrar'}
          </button>
        }
        {...props}
      />
    );
  },
);