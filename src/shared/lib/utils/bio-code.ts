import { sha256, randomHex } from '@/shared/lib/crypto';

// Bio code format: PR-{userId_hash_5}-{random_5}
// Cryptographically bound to user — server can verify the prefix matches the userId.
export function generateBioCode(userId: string): string {
  const hash = sha256(userId).slice(0, 5);
  const rand = randomHex(3).slice(0, 5);
  return `PR-${hash}-${rand}`;
}

export function isValidBioCodeShape(code: string): boolean {
  return /^PR-[a-f0-9]{5}-[a-f0-9]{5}$/.test(code);
}

export function bioCodeBelongsToUser(code: string, userId: string): boolean {
  if (!isValidBioCodeShape(code)) return false;
  const expected = sha256(userId).slice(0, 5);
  return code.startsWith(`PR-${expected}-`);
}
