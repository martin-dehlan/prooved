// Source: Vinted public API (unofficial). Bio-Code lookup in user.about field.
// fragile — Vinted may rate-limit or change shape.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const UA = 'Prooved/1.0 (+https://prooved.de)';

export function extractVintedUserIdFromUrl(url: string): string | null {
  // https://www.vinted.de/member/12345678-handle
  const m = url.match(/\/member\/(\d+)/);
  return m ? m[1]! : null;
}

export async function fetchVintedUser(userId: string): Promise<{
  about: string;
  url: string;
  ratingScore: number | null;
  ratingCount: number | null;
  memberSince: string | null;
}> {
  const res = await fetch(`https://www.vinted.de/api/v2/users/${userId}`, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Vinted user fetch failed: ${res.status}`);
  const json = (await res.json()) as {
    user?: {
      about?: string | null;
      profile_url?: string;
      feedback_reputation?: number | null;
      feedback_count?: number | null;
      created_at?: string;
    };
  };
  const u = json.user ?? {};
  return {
    about: u.about ?? '',
    url: u.profile_url ?? `https://www.vinted.de/member/${userId}`,
    ratingScore: typeof u.feedback_reputation === 'number' ? u.feedback_reputation * 5 : null,
    ratingCount: u.feedback_count ?? null,
    memberSince: u.created_at ?? null,
  };
}

export async function vintedBioContainsCode(userId: string, code: string): Promise<{
  matched: boolean;
  profile: PlatformProfile;
}> {
  const data = await fetchVintedUser(userId);
  const matched = data.about.includes(code);
  return {
    matched,
    profile: {
      platformUserId: userId,
      url: data.url,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: null,
      negativeCount: null,
      memberSince: data.memberSince,
    },
  };
}

export const vintedAdapter: PlatformAdapter = {
  platform: 'vinted',
  tier: 'silver',
  method: 'bio_code',
  async fetchProfile({ url, userId }) {
    const id = userId ?? (url ? extractVintedUserIdFromUrl(url) : null);
    if (!id) throw new Error('Vinted requires user id or member url');
    const data = await fetchVintedUser(id);
    return {
      platformUserId: id,
      url: data.url,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: null,
      negativeCount: null,
      memberSince: data.memberSince,
    };
  },
};
