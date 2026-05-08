// Source: Etsy API v3 — OAuth 2.0 with PKCE.
// Docs: https://developers.etsy.com/documentation/essentials/authentication
//       https://developers.etsy.com/documentation/reference/#operation/getShopByOwnerUserId
//       https://developers.etsy.com/documentation/reference/#operation/getShopReceipt (not for reviews)
//
// Reviews on Etsy live on the SHOP, not the user. We fetch the user's first shop
// and read its review_count + review_average.

import { createHash, randomBytes } from 'node:crypto';
import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const ETSY_AUTHORIZE = 'https://www.etsy.com/oauth/connect';
const ETSY_TOKEN = 'https://api.etsy.com/v3/public/oauth/token';
const ETSY_API = 'https://openapi.etsy.com/v3';

const SCOPES = ['shops_r', 'profile_r'].join(' ');

export interface EtsyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
}

export interface EtsyPkce {
  verifier: string;
  challenge: string;
}

/** Generate PKCE pair. Verifier 64 chars random, challenge = base64url(sha256(verifier)). */
export function createPkce(): EtsyPkce {
  const verifier = randomBytes(48).toString('base64url'); // 64 chars
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function getEtsyAuthorizeUrl(args: {
  state: string;
  codeChallenge: string;
  redirectUri: string;
}): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.ETSY_KEYSTRING ?? '',
    redirect_uri: args.redirectUri,
    scope: SCOPES,
    state: args.state,
    code_challenge: args.codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${ETSY_AUTHORIZE}?${params.toString()}`;
}

export async function exchangeEtsyCode(args: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<EtsyTokens> {
  const res = await fetch(ETSY_TOKEN, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.ETSY_KEYSTRING ?? '',
      redirect_uri: args.redirectUri,
      code: args.code,
      code_verifier: args.codeVerifier,
    }),
  });
  if (!res.ok) {
    throw new Error(`Etsy token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as EtsyTokens;
}

export async function refreshEtsyAccessToken(refreshToken: string): Promise<EtsyTokens> {
  const res = await fetch(ETSY_TOKEN, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ETSY_KEYSTRING ?? '',
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`Etsy refresh failed: ${res.status}`);
  return (await res.json()) as EtsyTokens;
}

/** Etsy access tokens are formatted as `<userId>.<token>`. */
function extractUserId(accessToken: string): string | null {
  const m = accessToken.match(/^(\d+)\./);
  return m ? m[1]! : null;
}

export async function fetchEtsyShopProfile(accessToken: string): Promise<PlatformProfile> {
  const userId = extractUserId(accessToken);
  if (!userId) throw new Error('Etsy access_token missing userId prefix');

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'x-api-key': process.env.ETSY_KEYSTRING ?? '',
    'User-Agent': 'Prooved/1.0',
  };

  // Try fetching the user's shop. If user has no shop, fall back to identity-only.
  const shopRes = await fetch(`${ETSY_API}/application/users/${userId}/shops`, {
    headers,
    signal: AbortSignal.timeout(5000),
  });

  let shopUrl: string | null = null;
  let ratingScore: number | null = null;
  let ratingCount: number | null = null;
  let memberSince: string | null = null;

  if (shopRes.ok) {
    const shop = (await shopRes.json()) as {
      shop_id?: number;
      shop_name?: string;
      url?: string;
      review_count?: number;
      review_average?: number;
      create_date?: number;
    };
    if (shop.url) shopUrl = shop.url;
    if (typeof shop.review_average === 'number') ratingScore = shop.review_average;
    if (typeof shop.review_count === 'number') ratingCount = shop.review_count;
    if (shop.create_date) memberSince = new Date(shop.create_date * 1000).toISOString();
  }

  // Fallback: user profile (no shop)
  if (!memberSince) {
    const userRes = await fetch(`${ETSY_API}/application/users/${userId}`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (userRes.ok) {
      const u = (await userRes.json()) as { create_timestamp?: number };
      if (u.create_timestamp) memberSince = new Date(u.create_timestamp * 1000).toISOString();
    }
  }

  return {
    platformUserId: userId,
    url: shopUrl ?? `https://www.etsy.com/people/${userId}`,
    ratingScore,
    ratingCount,
    positiveCount: null,
    negativeCount: null,
    memberSince,
  };
}

export const etsyAdapter: PlatformAdapter = {
  platform: 'etsy',
  tier: 'gold',
  method: 'oauth',
  async fetchProfile({ accessToken }) {
    if (!accessToken) throw new Error('Etsy requires accessToken');
    return fetchEtsyShopProfile(accessToken);
  },
};
