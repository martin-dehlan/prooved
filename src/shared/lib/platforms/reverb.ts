// Source: Reverb API v3 — Personal Access Token auth.
// Docs: https://reverb.com/page/api
// PAT generated in Reverb account settings → API & Integrations.
// We use it like an OAuth access_token (Bearer header).

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const API = 'https://api.reverb.com/api';
const REQUIRED_HEADERS = {
  'Accept-Version': '3.0',
  'Content-Type': 'application/hal+json',
  Accept: 'application/hal+json',
  'User-Agent': 'Prooved/1.0 (+https://prooved.xyz)',
};

interface ReverbAccount {
  email?: string;
  first_name?: string;
  last_name?: string;
  shop?: {
    id?: number | string;
    name?: string;
    slug?: string;
    _links?: { web?: { href?: string } };
  };
}

interface ReverbShopFeedback {
  count?: number;
  rating?: number;
  positive?: number;
  negative?: number;
  neutral?: number;
}

interface ReverbShop {
  id?: number | string;
  name?: string;
  slug?: string;
  created_at?: string;
  feedback_summary?: ReverbShopFeedback;
  _links?: { web?: { href?: string } };
}

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(8000),
    headers: { ...REQUIRED_HEADERS, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Reverb API ${url} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export interface ReverbProfile extends PlatformProfile {
  shopName: string | null;
  shopSlug: string | null;
}

export async function fetchReverbProfile(token: string): Promise<ReverbProfile> {
  const account = await fetchJson<ReverbAccount>(`${API}/my/account`, token);

  // Try shop endpoint — most users won't have a shop, that's ok
  let shop: ReverbShop | null = null;
  try {
    shop = await fetchJson<ReverbShop>(`${API}/my/shop`, token);
  } catch {
    shop = null;
  }

  const fb = shop?.feedback_summary;
  const shopUrl =
    shop?._links?.web?.href ??
    (shop?.slug ? `https://reverb.com/shop/${shop.slug}` : 'https://reverb.com');

  return {
    platformUserId: shop?.slug ?? account.shop?.slug ?? account.email ?? null,
    url: shopUrl,
    ratingScore: typeof fb?.rating === 'number' ? fb.rating : null,
    ratingCount: typeof fb?.count === 'number' ? fb.count : null,
    positiveCount: typeof fb?.positive === 'number' ? fb.positive : null,
    negativeCount: typeof fb?.negative === 'number' ? fb.negative : null,
    memberSince: shop?.created_at ?? null,
    shopName: shop?.name ?? null,
    shopSlug: shop?.slug ?? null,
  };
}

export const reverbAdapter: PlatformAdapter = {
  platform: 'reverb',
  tier: 'silver',
  method: 'oauth',
  async fetchProfile({ accessToken }) {
    if (!accessToken) throw new Error('Reverb requires personal access token');
    return fetchReverbProfile(accessToken);
  },
};
