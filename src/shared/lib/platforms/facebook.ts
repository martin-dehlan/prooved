// Source: Meta Graph API v21.0 — Facebook Login (OAuth 2.0).
// Docs: https://developers.facebook.com/docs/facebook-login/guides/access-tokens
// Trust: identity only. FB does NOT expose Marketplace seller ratings via any public API.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const FB_GRAPH = 'https://graph.facebook.com/v21.0';
const FB_AUTHORIZE = 'https://www.facebook.com/v21.0/dialog/oauth';
const FB_TOKEN = `${FB_GRAPH}/oauth/access_token`;
const FB_USERINFO = `${FB_GRAPH}/me`;
const SCOPES = 'public_profile,email';

export interface FacebookTokens {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export interface FacebookProfile extends PlatformProfile {
  verifiedName: string | null;
  pictureUrl: string | null;
  email: string | null;
}

export function getFacebookAuthorizeUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID ?? '',
    redirect_uri: redirectUri,
    state,
    scope: SCOPES,
    response_type: 'code',
    auth_type: 'rerequest',
  });
  return `${FB_AUTHORIZE}?${params.toString()}`;
}

export async function exchangeFacebookCode(
  code: string,
  redirectUri: string,
): Promise<FacebookTokens> {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID ?? '',
    client_secret: process.env.FACEBOOK_APP_SECRET ?? '',
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch(`${FB_TOKEN}?${params.toString()}`, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': 'Prooved/1.0' },
  });
  if (!res.ok) throw new Error(`Facebook token exchange failed: ${res.status}`);
  return (await res.json()) as FacebookTokens;
}

// Exchange short-lived (~1-2h) for long-lived (~60d) user token.
// Required so re-fetch cron doesn't break within 24h.
export async function exchangeForLongLivedToken(
  shortToken: string,
): Promise<FacebookTokens> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: process.env.FACEBOOK_APP_ID ?? '',
    client_secret: process.env.FACEBOOK_APP_SECRET ?? '',
    fb_exchange_token: shortToken,
  });
  const res = await fetch(`${FB_TOKEN}?${params.toString()}`, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': 'Prooved/1.0' },
  });
  if (!res.ok) throw new Error(`Facebook long-lived exchange failed: ${res.status}`);
  return (await res.json()) as FacebookTokens;
}

export async function fetchFacebookProfile(accessToken: string): Promise<FacebookProfile> {
  const params = new URLSearchParams({
    fields: 'id,name,first_name,last_name,email,picture.type(large)',
    access_token: accessToken,
  });
  const res = await fetch(`${FB_USERINFO}?${params.toString()}`, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': 'Prooved/1.0' },
  });
  if (!res.ok) throw new Error(`Facebook userinfo failed: ${res.status}`);
  const u = (await res.json()) as {
    id?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
  };
  const verifiedName =
    u.name?.trim() ||
    [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
    null;
  const profileUrl = u.id ? `https://www.facebook.com/${u.id}` : 'https://www.facebook.com';
  return {
    platformUserId: u.id ?? null,
    url: profileUrl,
    ratingScore: null,
    ratingCount: null,
    positiveCount: null,
    negativeCount: null,
    memberSince: null,
    identityVerified: Boolean(u.email),
    verifiedName,
    pictureUrl: u.picture?.data?.url?.trim() || null,
    email: u.email?.trim() || null,
  };
}

export const facebookAdapter: PlatformAdapter = {
  platform: 'facebook',
  tier: 'silver',
  method: 'oauth',
  async fetchProfile({ accessToken }) {
    if (!accessToken) throw new Error('Facebook requires accessToken');
    return fetchFacebookProfile(accessToken);
  },
};
