import type { Credential } from '@/lib/api/credentials';

export const CREDENTIAL_GRACE_DAYS = 7;

const DAY_MS = 86_400_000;

function reviewDeadline(credential: Credential): number | null {
  if (!credential.next_review_at) return null;
  return new Date(credential.next_review_at).getTime() + CREDENTIAL_GRACE_DAYS * DAY_MS;
}

export function isCredentialActive(credential?: Credential): boolean {
  if (credential?.status !== 'approved') return false;
  const deadline = reviewDeadline(credential);
  return deadline === null || Date.now() <= deadline;
}

export function isReviewOverdue(credential?: Credential): boolean {
  if (!credential?.next_review_at) return false;
  if (credential.status !== 'approved') return false;
  return Date.now() > new Date(credential.next_review_at).getTime();
}

export function daysUntilBlock(credential: Credential): number {
  const deadline = reviewDeadline(credential);
  if (deadline === null) return 0;
  return Math.max(0, Math.ceil((deadline - Date.now()) / DAY_MS));
}