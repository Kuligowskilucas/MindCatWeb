import { getAccessToken, setAccessToken } from '@/lib/authToken';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const REFRESH_PATH = '/refresh';

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

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Troca o refresh cookie por um access novo.
 *
 * O backend ROTACIONA o par a cada renovação: o refresh usado morre na hora.
 * Se duas requisições tomarem 401 juntas e cada uma chamar /refresh, a segunda
 * chega com um token já revogado e derruba a sessão. Por isso a chamada é
 * compartilhada — quem chegar durante o voo espera o mesmo resultado.
 */
function refreshAccessToken(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/api${REFRESH_PATH}`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        setAccessToken(null);
        return false;
      }

      const data = (await res.json()) as { token?: string };

      if (!data.token) {
        setAccessToken(null);
        return false;
      }

      setAccessToken(data.token);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
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

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (options.body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
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

  // Access vencido (ou ausente após um F5): tenta reconstruir pelo refresh
  // cookie uma única vez e repete a requisição original.
  if (res.status === 401 && !isRetry && path !== REFRESH_PATH) {
    const renewed = await refreshAccessToken();

    if (renewed) {
      return send<T>(path, options, true);
    }
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
    setAccessToken(null);
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