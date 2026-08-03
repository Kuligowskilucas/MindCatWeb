import { describe, it, expect } from 'vitest';
import { ApiError, NetworkError } from '@/lib/http';
import { inviteErrorMessage, redeemErrorMessage } from '@/hooks/useInvites';

describe('inviteErrorMessage', () => {
  it('pede ativar o compartilhamento no 403', () => {
    expect(inviteErrorMessage(new ApiError(403, 'x'))).toBe(
      'Ative o compartilhamento de dados acima antes de gerar um convite.',
    );
  });

  it('sinaliza throttle no 429', () => {
    expect(inviteErrorMessage(new ApiError(429, 'x'))).toBe(
      'Muitas tentativas seguidas. Aguarde um instante.',
    );
  });

  it('cai no genérico para outros status da API', () => {
    expect(inviteErrorMessage(new ApiError(500, 'x'))).toBe(
      'Algo deu errado. Tente novamente.',
    );
  });

  it('cai no genérico para erros que não são da API', () => {
    expect(inviteErrorMessage(new NetworkError())).toBe(
      'Algo deu errado. Tente novamente.',
    );
    expect(inviteErrorMessage(new Error('qualquer'))).toBe(
      'Algo deu errado. Tente novamente.',
    );
  });
});

describe('redeemErrorMessage', () => {
  it('explica código inválido ou expirado no 422', () => {
    expect(redeemErrorMessage(new ApiError(422, 'x'))).toBe(
      'Código inválido ou expirado. Peça um novo ao paciente.',
    );
  });

  it('explica falta de consentimento do paciente no 403', () => {
    expect(redeemErrorMessage(new ApiError(403, 'x'))).toBe(
      'O paciente ainda não autorizou o compartilhamento de dados no app.',
    );
  });

  it('sinaliza throttle no 429', () => {
    expect(redeemErrorMessage(new ApiError(429, 'x'))).toBe(
      'Muitas tentativas seguidas. Aguarde um instante.',
    );
  });

  it('cai no genérico para outros erros', () => {
    expect(redeemErrorMessage(new ApiError(500, 'x'))).toBe(
      'Algo deu errado. Tente novamente.',
    );
    expect(redeemErrorMessage(new Error('qualquer'))).toBe(
      'Algo deu errado. Tente novamente.',
    );
  });
});