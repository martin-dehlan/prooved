// Source: Reverb API v3 — server uses static REVERB_API_TOKEN (public-data scope).
// User-binding via bio-code in shop description (no per-user OAuth available).
// Docs: https://www.reverb.com/swagger#/

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const API = 'https://api.reverb.com/api';
const HEADERS = (token: string) => ({
  'Accept-Version': '3.0',
  Accept: 'application/hal+json',
  'Content-Type': 'application/hal+json',
  Authorization: `Bearer ${token}`,
  'User-Agent': 'Prooved/1.0 (+https://prooved.xyz)',
});

interface ReverbShop {
  id?: number | string;
  name?: string;
  slug?: string;
  description?: string;
  about?: string;
  created_at?: string;
  feedback_summary?: {
    count?: number;
    rating?: number;
    positive?: number;
    negative?: number;
  };
  _links?: { web?: { href?: string } };
}

/** Extract slug from a Reverb shop URL or accept bare slug. */
export function extractReverbSlug(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const m =
    trimmed.match(/reverb\.com\/(?:shop|s)\/([a-zA-Z0-9_.-]+)/) ??
    trimmed.match(/^([a-zA-Z0-9_.-]+)$/);
  return m ? m[1]! : null;
}

export interface ReverbScrape {
  description: string;
  shop: ReverbShop;
  url: string;
  ratingScore: number | null;
  ratingCount: number | null;
  positiveCount: number | null;
  negativeCount: number | null;
  memberSince: string | null;
}

export async function scrapeReverbShop(slug: string): Promise<ReverbScrape> {
  const token = process.env.REVERB_API_TOKEN;
  if (!token) throw new Error('REVERB_API_TOKEN env not configured');

  const res = await fetch(`${API}/shops/${encodeURIComponent(slug)}`, {
    method: 'GET',
    signal: AbortSignal.timeout(8000),
    headers: HEADERS(token),
  });
  if (!res.ok) throw new Error(`Reverb shop fetch failed: ${res.status}`);

  const shop = (await res.json()) as ReverbShop;
  const description = shop.description ?? shop.about ?? '';
  const fb = shop.feedback_summary;
  const url =
    shop._links?.web?.href ??
    (shop.slug ? `https://reverb.com/shop/${shop.slug}` : `https://reverb.com/shop/${slug}`);

  return {
    description,
    shop,
    url,
    ratingScore: typeof fb?.rating === 'number' ? fb.rating : null,
    ratingCount: typeof fb?.count === 'number' ? fb.count : null,
    positiveCount: typeof fb?.positive === 'number' ? fb.positive : null,
    negativeCount: typeof fb?.negative === 'number' ? fb.negative : null,
    memberSince: shop.created_at ?? null,
  };
}

export async function reverbBioContainsCode(
  slug: string,
  code: string,
): Promise<{ matched: boolean; profile: PlatformProfile; shopName: string | null }> {
  const data = await scrapeReverbShop(slug);
  return {
    matched: data.description.includes(code),
    shopName: data.shop.name ?? null,
    profile: {
      platformUserId: data.shop.slug ?? slug,
      url: data.url,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: data.positiveCount,
      negativeCount: data.negativeCount,
      memberSince: data.memberSince,
    },
  };
}

export const reverbAdapter: PlatformAdapter = {
  platform: 'reverb',
  tier: 'silver',
  method: 'bio_code',
  async fetchProfile({ url, userId }) {
    const slug = userId ?? (url ? extractReverbSlug(url) : null);
    if (!slug) throw new Error('Reverb requires shop URL or slug');
    const data = await scrapeReverbShop(slug);
    return {
      platformUserId: data.shop.slug ?? slug,
      url: data.url,
      ratingScore: data.ratingScore,
      ratingCount: data.ratingCount,
      positiveCount: data.positiveCount,
      negativeCount: data.negativeCount,
      memberSince: data.memberSince,
    };
  },
};
