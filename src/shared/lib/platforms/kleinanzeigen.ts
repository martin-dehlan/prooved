// Source: Kleinanzeigen.de public HTML (no official API).
// Profile pages have NO bio field — code goes in a listing (title or description).
// We accept either a listing URL (s-anzeige/...) or profile URL (s-bestandsliste/pro).
// FRAGILE — markup may change.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Safari/605.1.15';

const BASE = 'https://www.kleinanzeigen.de';

type SourceKind = 'listing' | 'bestandsliste' | 'pro';

export interface KleinanzeigenSource {
  kind: SourceKind;
  url: string;
  userId: string;
}

function isNumeric(id: string): boolean {
  return /^\d+$/.test(id);
}

function extractUserIdFromHtml(html: string): string | null {
  return (
    html.match(/userId=(\d+)/)?.[1] ??
    html.match(/"userId"\s*:\s*"?(\d+)/)?.[1] ??
    html.match(/data-user-id="(\d+)"/)?.[1] ??
    null
  );
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'de-DE,de;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`Kleinanzeigen fetch failed: ${res.status}`);
  return res.text();
}

/** Parse user input — supports listing, bestandsliste, or pro URLs. */
export async function resolveKleinanzeigenSource(
  rawUrl: string,
): Promise<KleinanzeigenSource> {
  const url = rawUrl.trim();

  const userIdMatch = url.match(/userId=(\d+)/);
  if (userIdMatch) {
    return {
      kind: 'bestandsliste',
      url: `${BASE}/s-bestandsliste.html?userId=${userIdMatch[1]}`,
      userId: userIdMatch[1]!,
    };
  }

  const proMatch = url.match(/\/pro\/([a-zA-Z0-9-]+)/);
  if (proMatch) {
    // Pro slugs aren't numeric userIds — fetch page to find the numeric one
    const html = await fetchHtml(`${BASE}/pro/${encodeURIComponent(proMatch[1]!)}`);
    const id = extractUserIdFromHtml(html);
    if (!id) throw new Error('Konnte Verkäufer-ID auf Pro-Profil nicht finden');
    return {
      kind: 'pro',
      url: `${BASE}/pro/${encodeURIComponent(proMatch[1]!)}`,
      userId: id,
    };
  }

  // Listing URL: /s-anzeige/<slug>/<listingId>
  if (/\/s-anzeige\//.test(url)) {
    const html = await fetchHtml(url);
    const id = extractUserIdFromHtml(html);
    if (!id) throw new Error('Konnte Verkäufer-ID aus Anzeige nicht finden');
    return { kind: 'listing', url, userId: id };
  }

  throw new Error(
    'URL nicht erkannt — gib eine Anzeigen-URL (kleinanzeigen.de/s-anzeige/…) oder Profil-URL (?userId=…) ein',
  );
}

interface ProfileScrape {
  url: string;
  ratingScore: number | null;
  ratingCount: number | null;
  memberSince: string | null;
}

/** Scrape bestandsliste for rating data (canonical profile page). */
export async function scrapeKleinanzeigenProfile(userId: string): Promise<ProfileScrape> {
  if (!isNumeric(userId)) throw new Error('userId must be numeric for bestandsliste');
  const url = `${BASE}/s-bestandsliste.html?userId=${userId}`;
  const html = await fetchHtml(url);

  const ratingScore = Number(
    html.match(/data-rating-stars="([0-9.]+)"/)?.[1] ??
      html.match(/(\d(?:[.,]\d)?)\s*\/\s*5\s*Sterne/)?.[1]?.replace(',', '.') ??
      'NaN',
  );
  const ratingCount = Number(html.match(/(\d+)\s*Bewertung/)?.[1] ?? 'NaN');
  const memberSince = html.match(/[Aa]ktiv seit\s*([0-9.]{6,10})/)?.[1] ?? null;

  return {
    url,
    ratingScore: Number.isFinite(ratingScore) ? ratingScore : null,
    ratingCount: Number.isFinite(ratingCount) ? ratingCount : null,
    memberSince,
  };
}

/** Verify code presence on the source URL the user provided. */
export async function kleinanzeigenSourceContainsCode(
  source: KleinanzeigenSource,
  code: string,
): Promise<{ matched: boolean; profile: PlatformProfile }> {
  const html = await fetchHtml(source.url);
  const matched = html.includes(code);

  // On match, also fetch bestandsliste for ratings (canonical profile)
  let profileScrape: ProfileScrape | null = null;
  if (matched) {
    try {
      profileScrape = await scrapeKleinanzeigenProfile(source.userId);
    } catch {
      // bestandsliste might not exist for new sellers — continue without ratings
    }
  }

  return {
    matched,
    profile: {
      platformUserId: source.userId,
      url: profileScrape?.url ?? source.url,
      ratingScore: profileScrape?.ratingScore ?? null,
      ratingCount: profileScrape?.ratingCount ?? null,
      positiveCount: null,
      negativeCount: null,
      memberSince: profileScrape?.memberSince ?? null,
    },
  };
}

/** Legacy entry by userId — kept for refresh path. */
export async function kleinanzeigenBioContainsCode(
  userId: string,
  code: string,
): Promise<{ matched: boolean; profile: PlatformProfile }> {
  return kleinanzeigenSourceContainsCode(
    {
      kind: 'bestandsliste',
      url: `${BASE}/s-bestandsliste.html?userId=${userId}`,
      userId,
    },
    code,
  );
}

export const kleinanzeigenAdapter: PlatformAdapter = {
  platform: 'kleinanzeigen',
  tier: 'silver',
  method: 'bio_code',
  async fetchProfile({ url, userId }) {
    const id = userId ?? (url ? url.match(/userId=(\d+)/)?.[1] : null);
    if (!id) throw new Error('Kleinanzeigen requires numeric userId');
    const data = await scrapeKleinanzeigenProfile(id);
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

// Backwards-compat export
export function extractKleinanzeigenIdFromUrl(url: string): string | null {
  return url.match(/userId=(\d+)/)?.[1] ?? url.match(/\/pro\/([a-zA-Z0-9-]+)/)?.[1] ?? null;
}
