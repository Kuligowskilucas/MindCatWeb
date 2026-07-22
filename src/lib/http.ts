const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Primeira mensagem de erro de um campo específico. */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Não conseguimos falar com o servidor. Verifique sua conexão.');
    this.name = 'NetworkError';
  }
}

export const AUTH_EXPIRED_EVENT = 'mindcat:auth-expired';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

/** Garante que o cookie XSRF-TOKEN existe antes de um request que muda estado. */
async function ensureCsrfCookie(force = false): Promise<void> {
  if (!force && readCookie('XSRF-TOKEN')) return;

  const res = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new ApiError(res.status, 'Falha ao inicializar a sessão.');
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  /** Não dispara o evento de sessão expirada no 401 (usado pelo /me inicial). */
  silent401?: boolean;
};

async function send<T>(
  path: string,
  options: RequestOptions,
  isRetry: boolean,
): Promise<T> {
  const method = options.method ?? 'GET';
  const mutating = method !== 'GET';

  if (mutating) {
    await ensureCsrfCookie(isRetry);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (options.body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (mutating) {
    const token = readCookie('XSRF-TOKEN');
    if (token) {
      // Laravel envia o cookie URL-encoded. Sem o decode, o header não bate.
      headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      credentials: 'include',
      signal: options.signal,
      body:
        options.body !== undefined
          ? isFormData
            ? (options.body as FormData)
            : JSON.stringify(options.body)
          : undefined,
    });
  } catch {
    throw new NetworkError();
  }

  // 419 = CSRF token expirado/inválido. Renova o cookie e tenta uma vez.
  if (res.status === 419 && !isRetry) {
    return send<T>(path, options, true);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (res.ok) {
    return payload as T;
  }

  if (res.status === 401 && !options.silent401 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }

  const body = (payload ?? {}) as { message?: string; errors?: Record<string, string[]> };
  
  throw new ApiError(
    res.status,
    body.message ?? messageForStatus(res.status),
    body.errors,
  );
}

function messageForStatus(status: number): string {
  switch (status) {
    case 401: return 'Sua sessão expirou. Entre novamente.';
    case 403: return 'Você não tem permissão para isso.';
    case 404: return 'Não encontramos o que você procura.';
    case 429: return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
    default:  return status >= 500
      ? 'Algo deu errado do nosso lado. Tente novamente em instantes.'
      : 'Não foi possível concluir a ação.';
  }
}

export const http = {
  get:    <T>(path: string, o: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    send<T>(path, { ...o, method: 'GET' }, false),
  post:   <T>(path: string, body?: unknown, o: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    send<T>(path, { ...o, method: 'POST', body }, false),
  put:    <T>(path: string, body?: unknown, o: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    send<T>(path, { ...o, method: 'PUT', body }, false),
  patch:  <T>(path: string, body?: unknown, o: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    send<T>(path, { ...o, method: 'PATCH', body }, false),
  delete: <T>(path: string, body?: unknown, o: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    send<T>(path, { ...o, method: 'DELETE', body }, false),
};