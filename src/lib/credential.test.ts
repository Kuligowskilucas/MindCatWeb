import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Credential, CredentialStatus } from '@/lib/api/credentials';
import {
  CREDENTIAL_GRACE_DAYS,
  isCredentialActive,
  isReviewOverdue,
  daysUntilBlock,
} from '@/lib/credential';

const NOW = new Date('2026-08-03T12:00:00.000Z');
const DAY = 86_400_000;

function iso(offsetDays: number): string {
  return new Date(NOW.getTime() + offsetDays * DAY).toISOString();
}

function cred(overrides: Partial<Credential> = {}): Credential {
  return {
    id: 1,
    status: 'approved' as CredentialStatus,
    crp_number: '06/12345',
    crp_region: 'PR',
    epsi_registered: true,
    rejection_reason: null,
    submitted_at: iso(-30),
    verified_at: iso(-30),
    next_review_at: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('isCredentialActive', () => {
  it('é false quando não há credencial', () => {
    expect(isCredentialActive(undefined)).toBe(false);
  });

  it('é false para qualquer status que não seja approved', () => {
    for (const status of [
      'pending',
      'submitted',
      'under_review',
      'rejected',
      'suspended',
      'expired',
    ] as CredentialStatus[]) {
      expect(isCredentialActive(cred({ status }))).toBe(false);
    }
  });

  it('trata next_review_at nulo como "nunca expira" (invariante da factory pro())', () => {
    expect(isCredentialActive(cred({ next_review_at: null }))).toBe(true);
  });

  it('é true quando a revisão ainda está no futuro', () => {
    expect(isCredentialActive(cred({ next_review_at: iso(10) }))).toBe(true);
  });

  it('permanece ativa dentro da janela de carência de 7 dias após a revisão', () => {
    expect(isCredentialActive(cred({ next_review_at: iso(-2) }))).toBe(true);
  });

  it('bloqueia depois que a carência de 7 dias expira', () => {
    expect(isCredentialActive(cred({ next_review_at: iso(-10) }))).toBe(false);
  });
});

describe('isReviewOverdue', () => {
  it('é false quando não há data de revisão', () => {
    expect(isReviewOverdue(cred({ next_review_at: null }))).toBe(false);
  });

  it('é false quando o status não é approved, mesmo com revisão vencida', () => {
    expect(
      isReviewOverdue(cred({ status: 'suspended', next_review_at: iso(-2) })),
    ).toBe(false);
  });

  it('é true assim que a data de revisão passa, antes de bloquear', () => {
    expect(isReviewOverdue(cred({ next_review_at: iso(-2) }))).toBe(true);
  });

  it('é false enquanto a revisão está no futuro', () => {
    expect(isReviewOverdue(cred({ next_review_at: iso(3) }))).toBe(false);
  });
});

describe('daysUntilBlock', () => {
  it('é 0 quando não há data de revisão', () => {
    expect(daysUntilBlock(cred({ next_review_at: null }))).toBe(0);
  });

  it('conta os dias restantes da carência após a revisão vencer', () => {
    expect(daysUntilBlock(cred({ next_review_at: iso(-2) }))).toBe(
      CREDENTIAL_GRACE_DAYS - 2,
    );
  });

  it('nunca é negativo depois que a carência acaba', () => {
    expect(daysUntilBlock(cred({ next_review_at: iso(-10) }))).toBe(0);
  });
});