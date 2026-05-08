// Source: Discogs public REST API (HTML scrape was returning 403).
// Docs: https://www.discogs.com/developers
// Endpoint: GET /users/{username} — public, no auth needed.
// User-Agent must identify app per Discogs ToS.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const UA = 'Prooved/1.0 (+https://prooved.xyz)';
const API_BASE = 'https://api.discogs.com';

/** Accepts discogs.com/user/<username> or just <username>. */
export function extractDiscogsUsername(input: string): string | null {
  const trimmed = input.trim();
  const m = trimmed.match(/discogs\.com\/(?:user\/)?([A-Za-z0-9_.-]+)/);
  if (m) return m[1]!;
  if (/^[A-Za-z0-9_.-]+$/.test(trimmed)) return trimmed;
  return null;
}

interface DiscogsUserResponse {
  username?: string;
  profile?: string;
  uri?: string;
  registered?: string;
  rating_avg?: number;
  num_collection?: number;
  num_for_sale?: number;
  releases_contributed?: number;
}

export interface DiscogsScrape {
  profile: string;
  url: string;
  ratingScore: number | null;
  ratingCount: number | null;
  memberSince: string | null;
}

export async function scrapeDiscogsProfile(username: string): Promise<DiscogsScrape> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`, {
    method: 'GET',
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': UA,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Discogs API failed: ${res.status}`);
  }
  const json = (await res.json()) as DiscogsUserResponse;
  return {
    profile: json.profile ?? '',
    url: json.uri ?? `https://www.discogs.com/user/${encodeURIComponent(username)}`,
    ratingScore: typeof json.rating_avg === 'number' ? json.rating_avg : null,
    // Discogs has no public seller-feedback count via /users; use releases_contributed as activity proxy
    ratingCount: typeof json.releases_contributed === 'number' ? json.releases_contributed : null,
    memberSince: json.registered ?? null,
  };
}

export async function discogsBioContainsCode(
  username: string,
  code: string,
): Promise<{ matched: boolean; profile: PlatformProfile }> {
  const data = await scrapeDiscogsProfile(username);
  return {
    matched: data.profile.includes(code),
    profile: {
      platformUserId: username,
      url: data.url,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: null,
      negativeCount: null,
      memberSince: data.memberSince,
    },
  };
}

export const discogsAdapter: PlatformAdapter = {
  platform: 'discogs',
  tier: 'silver',
  method: 'bio_code',
  async fetchProfile({ url, userId }) {
    const id = userId ?? (url ? extractDiscogsUsername(url) : null);
    if (!id) throw new Error('Discogs requires username or profile URL');
    const data = await scrapeDiscogsProfile(id);
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
