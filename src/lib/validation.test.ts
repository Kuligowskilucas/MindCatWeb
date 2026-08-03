import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateCode,
} from '@/lib/validation';

describe('validateEmail', () => {
  it('exige o campo', () => {
    expect(validateEmail('')).toBe('O email é obrigatório.');
    expect(validateEmail('   ')).toBe('O email é obrigatório.');
  });

  it('rejeita formato grosseiramente inválido', () => {
    expect(validateEmail('sem-arroba')).toBe('Informe um email válido.');
    expect(validateEmail('a@b')).toBe('Informe um email válido.');
    expect(validateEmail('a@b.')).toBe('Informe um email válido.');
  });

  it('aceita email plausível e ignora espaços nas bordas', () => {
    expect(validateEmail('lucas@mindcat.com.br')).toBeNull();
    expect(validateEmail('  lucas@mindcat.com.br  ')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('exige mínimo de 8 caracteres', () => {
    expect(validatePassword('Aa1xxxx')).toBe(
      'A senha deve ter pelo menos 8 caracteres.',
    );
  });

  it('exige maiúscula, minúscula e número', () => {
    expect(validatePassword('senhafraca1')).toBe(
      'A senha deve ter pelo menos uma letra maiúscula.',
    );
    expect(validatePassword('SENHAFORTE1')).toBe(
      'A senha deve ter pelo menos uma letra minúscula.',
    );
    expect(validatePassword('SenhaForte')).toBe(
      'A senha deve ter pelo menos um número.',
    );
  });

  it('aceita senha que satisfaz todas as regras', () => {
    expect(validatePassword('SenhaForte1')).toBeNull();
  });
});

describe('validateName', () => {
  it('exige o campo e um mínimo de dois caracteres', () => {
    expect(validateName('')).toBe('O nome é obrigatório.');
    expect(validateName('  ')).toBe('O nome é obrigatório.');
    expect(validateName('L')).toBe('Digite seu nome completo.');
  });

  it('aceita nome válido', () => {
    expect(validateName('Lucas')).toBeNull();
  });
});

describe('validateCode', () => {
  it('exige exatamente 6 dígitos', () => {
    expect(validateCode('12345')).toBe('O código deve ter 6 dígitos.');
    expect(validateCode('1234567')).toBe('O código deve ter 6 dígitos.');
    expect(validateCode('12a456')).toBe('O código deve ter 6 dígitos.');
  });

  it('aceita código de 6 dígitos', () => {
    expect(validateCode('123456')).toBeNull();
  });
});