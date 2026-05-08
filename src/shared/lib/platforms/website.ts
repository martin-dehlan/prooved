// Source: DNS TXT record on user's own domain.
// User sets `prooved-verify=<code>` as TXT record at root or _prooved subdomain.
// We resolve and look for matching value.

import { promises as dns } from 'node:dns';
import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

export const TXT_PREFIX = 'prooved-verify=';

export function normalizeDomain(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  // Strip protocol + path
  const stripped = trimmed
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '');
  // Basic shape: at least one dot, only [a-z0-9.-]
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(stripped)) {
    return null;
  }
  return stripped;
}

export async function domainHasVerifyToken(
  domain: string,
  expectedCode: string,
): Promise<{ matched: boolean; foundRecords: string[] }> {
  const expected = `${TXT_PREFIX}${expectedCode}`;

  // Try root domain + _prooved subdomain — both acceptable
  const candidates = [domain, `_prooved.${domain}`];
  const records: string[] = [];

  for (const host of candidates) {
    try {
      const txt = await dns.resolveTxt(host);
      for (const chunks of txt) {
        const joined = chunks.join('');
        records.push(joined);
        if (joined === expected) {
          return { matched: true, foundRecords: records };
        }
      }
    } catch {
      // NXDOMAIN or no TXT — keep trying next candidate
    }
  }

  return { matched: false, foundRecords: records };
}

export const websiteAdapter: PlatformAdapter = {
  platform: 'website',
  tier: 'silver',
  method: 'domain_dns',
  async fetchProfile({ url, userId }): Promise<PlatformProfile> {
    const domain = userId ?? (url ? normalizeDomain(url) : null);
    if (!domain) throw new Error('Website requires domain');
    return {
      platformUserId: domain,
      url: `https://${domain}`,
      ratingScore: null,
      ratingCount: null,
      positiveCount: null,
      negativeCount: null,
      memberSince: null,
    };
  },
};
