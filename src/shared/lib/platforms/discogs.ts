// Source: Discogs public profile HTML scrape.
// Bio-code goes in profile description (Settings → Profile → "Profile / Bio").
// FRAGILE — markup may change.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

/** Accepts discogs.com/user/<username> or just <username>. */
export function extractDiscogsUsername(input: string): string | null {
  const trimmed = input.trim();
  const m = trimmed.match(/discogs\.com\/(?:user\/)?([A-Za-z0-9_.-]+)/);
  if (m) return m[1]!;
  // Plain username
  if (/^[A-Za-z0-9_.-]+$/.test(trimmed)) return trimmed;
  return null;
}

export interface DiscogsScrape {
  html: string;
  url: string;
  ratingScore: number | null;
  ratingCount: number | null;
  memberSince: string | null;
}

export async function scrapeDiscogsProfile(username: string): Promise<DiscogsScrape> {
  const url = `https://www.discogs.com/user/${encodeURIComponent(username)}`;
  const res = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`Discogs profile fetch failed: ${res.status}`);
  const html = await res.text();

  const ratingScore = Number(html.match(/(\d(?:\.\d)?)\s*\/\s*5(?:\.0)?/)?.[1] ?? 'NaN');
  const ratingCount = Number(
    html.match(/(\d+)\s*ratings?/)?.[1] ??
      html.match(/(\d+)\s*Bewertung/)?.[1] ??
      'NaN',
  );
  const memberSince =
    html.match(/joined[^0-9]*([A-Z][a-z]+ \d{1,2}, \d{4})/)?.[1] ??
    html.match(/Mitglied seit[^0-9]*(\d{4})/)?.[1] ??
    null;

  return {
    html,
    url,
    ratingScore: Number.isFinite(ratingScore) ? ratingScore : null,
    ratingCount: Number.isFinite(ratingCount) ? ratingCount : null,
    memberSince,
  };
}

export async function discogsBioContainsCode(
  username: string,
  code: string,
): Promise<{ matched: boolean; profile: PlatformProfile }> {
  const data = await scrapeDiscogsProfile(username);
  return {
    matched: data.html.includes(code),
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
