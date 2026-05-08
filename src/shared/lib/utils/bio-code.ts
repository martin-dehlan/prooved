import { sha256 } from '@/shared/lib/crypto';

// Bio code: PR-{userId_hash_5}-{userId_platform_secret_hash_5}
// Deterministic per (userId, platform) so the same code can be shown to
// the user before they pick a profile URL — no DB write needed at display time.
const SECRET_SUFFIX = 'prooved-bio-v1';

export function generateBioCode(userId: string, platform: string): string {
  const userHash = sha256(userId).slice(0, 5);
  const platformHash = sha256(`${userId}:${platform}:${SECRET_SUFFIX}`).slice(0, 5);
  return `PR-${userHash}-${platformHash}`;
}

export function isValidBioCodeShape(code: string): boolean {
  return /^PR-[a-f0-9]{5}-[a-f0-9]{5}$/.test(code);
}

export function bioCodeBelongsToUser(code: string, userId: string): boolean {
  if (!isValidBioCodeShape(code)) return false;
  const expected = sha256(userId).slice(0, 5);
  return code.startsWith(`PR-${expected}-`);
}
