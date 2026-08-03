import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, ApiError, NetworkError, AUTH_EXPIRED_EVENT } from '@/lib/http';
import { getAccessToken, setAccessToken } from '@/lib/authToken';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  setAccessToken(null);
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requisição básica', () => {
  it('resolve com o corpo em JSON num 200', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { hello: 'world' }));
    await expect(http.get<{ hello: string }>('/ping')).resolves.toEqual({
      hello: 'world',
    });
  });

  it('anexa o Bearer quando há access token', async () => {
    setAccessToken('abc123');
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
    await http.get('/me');
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer abc123');
    expect(init.credentials).toBe('include');
  });

  it('não manda Authorization quando não há token', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
    await http.get('/publico');
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });
});

describe('erros', () => {
  it('lança ApiError com status e errors de campo num 422', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(422, {
        message: 'Dados inválidos.',
        errors: { email: ['Email já cadastrado.'] },
      }),
    );
    const err = await http
      .post('/register', {})
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
    expect((err as ApiError).fieldError('email')).toBe('Email já cadastrado.');
  });

  it('converte falha de fetch em NetworkError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('failed to fetch'));
    await expect(http.get('/qualquer')).rejects.toBeInstanceOf(NetworkError);
  });
});

describe('renovação de sessão via refresh', () => {
  it('renova no 401 e repete a requisição original', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expirado' })) 
      .mockResolvedValueOnce(jsonResponse(200, { token: 'novo-token' })) 
      .mockResolvedValueOnce(jsonResponse(200, { dados: true })); 

    await expect(http.get<{ dados: boolean }>('/protegido')).resolves.toEqual({
      dados: true,
    });
    expect(getAccessToken()).toBe('novo-token');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('dois 401 simultâneos disparam apenas um /refresh (single-flight)', async () => {
    const seen = new Set<string>();
    let refreshCalls = 0;

    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/api/refresh')) {
        refreshCalls += 1;
        return jsonResponse(200, { token: 'compartilhado' });
      }
      if (!seen.has(url)) {
        seen.add(url);
        return jsonResponse(401, { message: 'expirado' });
      }
      return jsonResponse(200, { url });
    });

    const [a, b] = await Promise.all([
      http.get<{ url: string }>('/recurso-a'),
      http.get<{ url: string }>('/recurso-b'),
    ]);

    expect(refreshCalls).toBe(1);
    expect(a.url).toContain('/recurso-a');
    expect(b.url).toContain('/recurso-b');
  });

  it('quando o refresh falha, dispara o evento de sessão expirada e limpa o token', async () => {
    setAccessToken('velho');
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expirado' }))
      .mockResolvedValueOnce(jsonResponse(401, { message: 'refresh morto' }));

    const expired = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, expired);

    await expect(http.get('/protegido')).rejects.toBeInstanceOf(ApiError);

    expect(expired).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    window.removeEventListener(AUTH_EXPIRED_EVENT, expired);
  });

  it('não dispara o evento de expiração quando silent401 está ligado (/me inicial)', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: 'sem sessão' }))
      .mockResolvedValueOnce(jsonResponse(401, {}));

    const expired = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, expired);

    await expect(
      http.get('/me', { silent401: true }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(expired).not.toHaveBeenCalled();
    window.removeEventListener(AUTH_EXPIRED_EVENT, expired);
  });
});