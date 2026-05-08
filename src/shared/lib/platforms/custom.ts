// Generic "any URL with our code in it" verification.
// User picks a label + pastes URL of any public page (forum bio, listing,
// social post, ...). We fetch HTML, check if the bio code is present.
// No rating extraction — pure ownership verification.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Safari/605.1.15';

export function isHttpsUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Domain string for storing as platform_user_id. */
export function urlDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export interface CustomMatchResult {
  matched: boolean;
  profile: PlatformProfile;
}

export async function customSourceContainsCode(
  url: string,
  code: string,
): Promise<CustomMatchResult> {
  if (!isHttpsUrl(url)) {
    throw new Error('URL muss mit http:// oder https:// beginnen');
  }
  const res = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
    },
  });
  if (!res.ok) {
    throw new Error(`URL nicht erreichbar (HTTP ${res.status})`);
  }
  const ctype = res.headers.get('content-type') ?? '';
  if (!ctype.includes('text/html') && !ctype.includes('application/xhtml')) {
    throw new Error('URL liefert kein HTML');
  }
  const html = await res.text();
  const matched = html.includes(code);
  const domain = urlDomain(url);

  return {
    matched,
    profile: {
      platformUserId: domain,
      url,
      ratingScore: null,
      ratingCount: null,
      positiveCount: null,
      negativeCount: null,
      memberSince: null,
    },
  };
}

export const customAdapter: PlatformAdapter = {
  platform: 'custom',
  tier: 'silver',
  method: 'bio_code',
  async fetchProfile({ url }) {
    if (!url) throw new Error('Custom platform requires url');
    return {
      platformUserId: urlDomain(url),
      url,
      ratingScore: null,
      ratingCount: null,
      positiveCount: null,
      negativeCount: null,
      memberSince: null,
    };
  },
};
