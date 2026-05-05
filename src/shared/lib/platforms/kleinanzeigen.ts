// Source: Kleinanzeigen.de public profile HTML (no official API).
// FRAGILE DEPENDENCY — markup may change without notice.
// On parse failure we return ratingScore: null and connection is marked
// "temporarily_unavailable" upstream.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const UA = 'Mozilla/5.0 (compatible; Prooved/1.0; +https://prooved.de)';

export function extractKleinanzeigenIdFromUrl(url: string): string | null {
  // https://www.kleinanzeigen.de/pro/<id> or /s-bestandsliste.html?userId=<id>
  const m1 = url.match(/\/pro\/([a-zA-Z0-9-]+)/);
  if (m1) return m1[1]!;
  const m2 = url.match(/userId=([a-zA-Z0-9-]+)/);
  if (m2) return m2[1]!;
  return null;
}

interface ScrapeResult {
  about: string;
  ratingScore: number | null;
  ratingCount: number | null;
  memberSince: string | null;
}

export async function scrapeKleinanzeigenProfile(userId: string): Promise<ScrapeResult> {
  const url = `https://www.kleinanzeigen.de/pro/${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': UA, Accept: 'text/html' },
  });
  if (!res.ok) throw new Error(`Kleinanzeigen profile fetch failed: ${res.status}`);
  const html = await res.text();

  const ratingScore = Number(html.match(/data-rating-stars="([0-9.]+)"/)?.[1] ?? 'NaN');
  const ratingCount = Number(html.match(/(\d+)\s*Bewertung/)?.[1] ?? 'NaN');
  const memberSince = html.match(/aktiv seit\s*([0-9.]+)/i)?.[1] ?? null;
  const aboutMatch = html.match(/<section[^>]*data-about[^>]*>([\s\S]*?)<\/section>/);
  const about = aboutMatch ? aboutMatch[1]!.replace(/<[^>]+>/g, ' ').trim() : '';

  return {
    about,
    ratingScore: Number.isFinite(ratingScore) ? ratingScore : null,
    ratingCount: Number.isFinite(ratingCount) ? ratingCount : null,
    memberSince,
  };
}

export async function kleinanzeigenBioContainsCode(userId: string, code: string): Promise<{
  matched: boolean;
  profile: PlatformProfile;
}> {
  const data = await scrapeKleinanzeigenProfile(userId);
  return {
    matched: data.about.includes(code),
    profile: {
      platformUserId: userId,
      url: `https://www.kleinanzeigen.de/pro/${encodeURIComponent(userId)}`,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: null,
      negativeCount: null,
      memberSince: data.memberSince,
    },
  };
}

export const kleinanzeigenAdapter: PlatformAdapter = {
  platform: 'kleinanzeigen',
  tier: 'silver',
  method: 'bio_code',
  async fetchProfile({ url, userId }) {
    const id = userId ?? (url ? extractKleinanzeigenIdFromUrl(url) : null);
    if (!id) throw new Error('Kleinanzeigen requires user id or pro url');
    const data = await scrapeKleinanzeigenProfile(id);
    return {
      platformUserId: id,
      url: `https://www.kleinanzeigen.de/pro/${encodeURIComponent(id)}`,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: null,
      negativeCount: null,
      memberSince: data.memberSince,
    };
  },
};
