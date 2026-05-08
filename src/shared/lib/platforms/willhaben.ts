// Source: Willhaben.at public seller-profile HTML scrape.
// Bio-code goes in seller description ("Über mich").
// URL pattern: willhaben.at/iad/seller-profile/<id> or willhaben.at/iad/kaufen-und-verkaufen/verkaeufer/<slug>
// FRAGILE — markup may change.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

export function extractWillhabenIdFromUrl(url: string): string | null {
  const trimmed = url.trim();
  const m1 = trimmed.match(/seller-profile[\/=]([a-zA-Z0-9-]+)/);
  if (m1) return m1[1]!;
  const m2 = trimmed.match(/verkaeufer\/([a-zA-Z0-9-]+)/);
  if (m2) return m2[1]!;
  return null;
}

export interface WillhabenScrape {
  html: string;
  url: string;
  ratingScore: number | null;
  ratingCount: number | null;
  memberSince: string | null;
}

export async function scrapeWillhabenProfile(id: string): Promise<WillhabenScrape> {
  const url = `https://www.willhaben.at/iad/seller-profile/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'de-AT,de;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`Willhaben profile fetch failed: ${res.status}`);
  const html = await res.text();

  // Common pattern: "X.X von 5", "X Bewertungen", "Mitglied seit YYYY"
  const ratingScore = Number(
    html.match(/(\d(?:[.,]\d)?)\s*\/?\s*(?:von|of)\s*5/)?.[1]?.replace(',', '.') ??
      html.match(/"averageRating"\s*:\s*(\d(?:\.\d)?)/)?.[1] ??
      'NaN',
  );
  const ratingCount = Number(
    html.match(/(\d+)\s*Bewertung/)?.[1] ??
      html.match(/"reviewCount"\s*:\s*(\d+)/)?.[1] ??
      'NaN',
  );
  const memberSince = html.match(/Mitglied seit[^0-9]*(\d{4})/)?.[1] ?? null;

  return {
    html,
    url,
    ratingScore: Number.isFinite(ratingScore) ? ratingScore : null,
    ratingCount: Number.isFinite(ratingCount) ? ratingCount : null,
    memberSince,
  };
}

export async function willhabenBioContainsCode(
  id: string,
  code: string,
): Promise<{ matched: boolean; profile: PlatformProfile }> {
  const data = await scrapeWillhabenProfile(id);
  return {
    matched: data.html.includes(code),
    profile: {
      platformUserId: id,
      url: data.url,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: null,
      negativeCount: null,
      memberSince: data.memberSince,
    },
  };
}

export const willhabenAdapter: PlatformAdapter = {
  platform: 'willhaben',
  tier: 'silver',
  method: 'bio_code',
  async fetchProfile({ url, userId }) {
    const id = userId ?? (url ? extractWillhabenIdFromUrl(url) : null);
    if (!id) throw new Error('Willhaben requires seller-profile URL');
    const data = await scrapeWillhabenProfile(id);
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
