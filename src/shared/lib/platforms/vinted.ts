// Source: Vinted public profile HTML (api/v2/users is blocked publicly).
// User data is embedded as escaped JSON inside the rendered HTML.
// FRAGILE — markup may change without notice.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Safari/605.1.15';

export function extractVintedUserIdFromUrl(url: string): string | null {
  // https://www.vinted.de/member/12345678[-handle]
  const m = url.match(/\/member\/(\d+)/);
  return m ? m[1]! : null;
}

interface VintedScrape {
  html: string;
  url: string;
  ratingScore: number | null;
  ratingCount: number | null;
  positiveCount: number | null;
  negativeCount: number | null;
  memberSince: string | null;
}

export async function scrapeVintedProfile(userId: string): Promise<VintedScrape> {
  const url = `https://www.vinted.de/member/${userId}`;
  const res = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'de-DE,de;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`Vinted profile fetch failed: ${res.status}`);
  const html = await res.text();

  // Embedded JSON is double-escaped (e.g. \"feedback_count\":4)
  const reputation = Number(html.match(/\\"feedback_reputation\\":([\d.]+)/)?.[1] ?? 'NaN');
  const count = Number(html.match(/\\"feedback_count\\":(\d+)/)?.[1] ?? 'NaN');
  const positive = Number(html.match(/\\"positive_feedback_count\\":(\d+)/)?.[1] ?? 'NaN');
  const negative = Number(html.match(/\\"negative_feedback_count\\":(\d+)/)?.[1] ?? 'NaN');
  const createdAt = html.match(/\\"created_at\\":(\d+)/)?.[1] ?? null;

  return {
    html,
    url,
    ratingScore: Number.isFinite(reputation)
      ? Math.round(reputation * 5 * 10) / 10
      : null,
    ratingCount: Number.isFinite(count) ? count : null,
    positiveCount: Number.isFinite(positive) ? positive : null,
    negativeCount: Number.isFinite(negative) ? negative : null,
    memberSince: createdAt ? new Date(Number(createdAt) * 1000).toISOString() : null,
  };
}

export async function vintedBioContainsCode(
  userId: string,
  code: string,
): Promise<{ matched: boolean; profile: PlatformProfile }> {
  const data = await scrapeVintedProfile(userId);
  const matched = data.html.includes(code);
  return {
    matched,
    profile: {
      platformUserId: userId,
      url: data.url,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: data.positiveCount,
      negativeCount: data.negativeCount,
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
    const data = await scrapeVintedProfile(id);
    return {
      platformUserId: id,
      url: data.url,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: data.positiveCount,
      negativeCount: data.negativeCount,
      memberSince: data.memberSince,
    };
  },
};
