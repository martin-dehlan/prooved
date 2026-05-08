// Source: Shpock public listing/profile HTML (Next.js SSR with __NEXT_DATA__ JSON).
// Profile pages have NO bio field — code goes in a listing (title or description).
// We parse the embedded JSON to find seller userId + ratings.
// FRAGILE — markup or apolloState shape may change.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Safari/605.1.15';

type SourceKind = 'listing' | 'profile';

export interface ShpockSource {
  kind: SourceKind;
  url: string;
  userId: string;
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
  if (!res.ok) throw new Error(`Shpock fetch failed: ${res.status}`);
  return res.text();
}

interface ShpockNextData {
  props?: {
    pageProps?: {
      apolloState?: Record<string, unknown>;
    };
  };
}

function extractNextData(html: string): ShpockNextData | null {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]!) as ShpockNextData;
  } catch {
    return null;
  }
}

interface UserSummary {
  userId?: string;
  avgRating?: number;
  numRatings?: number;
  isTrustedSeller?: boolean;
  memberSince?: string | number;
  createdAt?: string | number;
}

/** Find the first UserSummary entry in apolloState — that's the listing's seller. */
function findUserSummary(data: ShpockNextData): UserSummary | null {
  const apollo = data.props?.pageProps?.apolloState;
  if (!apollo) return null;
  for (const key of Object.keys(apollo)) {
    if (key.startsWith('UserSummary:')) {
      const value = apollo[key];
      if (value && typeof value === 'object') return value as UserSummary;
    }
  }
  return null;
}

/** Detect listing or profile URL. Listing: /<locale>/i/<id>/<slug>. Profile: /<locale>/u/<id>. */
export function classifyShpockUrl(url: string): { kind: SourceKind; localePath: string } | null {
  const trimmed = url.trim();
  if (/shpock\.com\/[a-z]{2}-[a-z]{2}\/i\//.test(trimmed)) {
    return { kind: 'listing', localePath: trimmed };
  }
  if (/shpock\.com\/[a-z]{2}-[a-z]{2}\/u\//.test(trimmed)) {
    return { kind: 'profile', localePath: trimmed };
  }
  return null;
}

export function extractShpockIdFromUrl(url: string): string | null {
  // Profile-form returns userId; listing-form has itemId — caller must resolve via fetch.
  const profileMatch = url.match(/\/u\/([A-Za-z0-9_-]+)/);
  if (profileMatch) return profileMatch[1]!;
  return null;
}

export async function resolveShpockSource(url: string): Promise<ShpockSource> {
  const cls = classifyShpockUrl(url);
  if (!cls) {
    throw new Error(
      'URL nicht erkannt — erwarte shpock.com/<locale>/i/<id> (Anzeige) oder /u/<id> (Profil)',
    );
  }

  const html = await fetchHtml(cls.localePath);
  const data = extractNextData(html);
  if (!data) throw new Error('Shpock-Seite konnte nicht geparst werden');
  const summary = findUserSummary(data);
  if (!summary?.userId) throw new Error('Verkäufer-ID konnte nicht extrahiert werden');

  return { kind: cls.kind, url: cls.localePath, userId: summary.userId };
}

export interface ShpockMatchResult {
  matched: boolean;
  profile: PlatformProfile;
}

/** Verify code presence on the user-submitted source URL. */
export async function shpockSourceContainsCode(
  source: ShpockSource,
  code: string,
): Promise<ShpockMatchResult> {
  const html = await fetchHtml(source.url);
  const matched = html.includes(code);

  // After verify, parse summary for ratings + canonical profile URL
  let summary: UserSummary | null = null;
  if (matched) {
    const data = extractNextData(html);
    if (data) summary = findUserSummary(data);
  }

  // Canonical profile URL = /de-de/u/<userId>
  const profileUrl = `https://www.shpock.com/de-de/u/${source.userId}`;

  const memberRaw = summary?.memberSince ?? summary?.createdAt;
  const memberSince =
    typeof memberRaw === 'number'
      ? new Date(memberRaw * 1000).toISOString()
      : typeof memberRaw === 'string'
        ? memberRaw
        : null;

  return {
    matched,
    profile: {
      platformUserId: source.userId,
      url: profileUrl,
      ratingScore: typeof summary?.avgRating === 'number' ? summary.avgRating : null,
      ratingCount: typeof summary?.numRatings === 'number' ? summary.numRatings : null,
      positiveCount: null,
      negativeCount: null,
      memberSince,
      identityVerified: summary?.isTrustedSeller === true,
    },
  };
}

/** Legacy entry by userId (for refresh path). */
export async function shpockBioContainsCode(
  userId: string,
  code: string,
): Promise<ShpockMatchResult> {
  return shpockSourceContainsCode(
    { kind: 'profile', url: `https://www.shpock.com/de-de/u/${userId}`, userId },
    code,
  );
}

export const shpockAdapter: PlatformAdapter = {
  platform: 'shpock',
  tier: 'silver',
  method: 'bio_code',
  async fetchProfile({ userId }) {
    if (!userId) throw new Error('Shpock requires userId');
    const result = await shpockBioContainsCode(userId, '__never_match__');
    return result.profile;
  },
};
