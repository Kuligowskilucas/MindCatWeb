export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'O email é obrigatório.';
  // Validação frouxa de propósito: a API é a autoridade. Só pega erro grosseiro.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Informe um email válido.';
  return null;
}

/** Espelha App\Rules\StrongPassword. Mantenha em sincronia com o backend. */
export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'A senha deve ter pelo menos uma letra maiúscula.';
  if (!/[a-z]/.test(password)) return 'A senha deve ter pelo menos uma letra minúscula.';
  if (!/[0-9]/.test(password)) return 'A senha deve ter pelo menos um número.';
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'O nome é obrigatório.';
  if (trimmed.length < 2) return 'Digite seu nome completo.';
  return null;
}

export function validateCode(code: string): string | null {
  if (!/^\d{6}$/.test(code)) return 'O código deve ter 6 dígitos.';
  return null;
}