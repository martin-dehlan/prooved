// Source: PayPal Identity API — /v1/identity/openidconnect/userinfo
// Docs: https://developer.paypal.com/docs/log-in-with-paypal/integrate/

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

function basePayPal(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

function authBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://www.paypal.com'
    : 'https://www.sandbox.paypal.com';
}

// PAYPAL_SCOPES override allows expanding once attributes are activated in DevPortal
// (App settings → Log in with PayPal → "Advanced settings"). Default 'openid' always works.
export function getPayPalAuthorizeUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.PAYPAL_CLIENT_ID ?? '',
    response_type: 'code',
    scope: process.env.PAYPAL_SCOPES ?? 'openid',
    redirect_uri: redirectUri,
    state,
  });
  return `${authBase()}/connect/?${params.toString()}`;
}

export interface PayPalTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export async function exchangePayPalCode(code: string, redirectUri: string): Promise<PayPalTokens> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch(`${basePayPal()}/v1/oauth2/token`, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
      'User-Agent': 'Prooved/1.0',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) throw new Error(`PayPal token exchange failed: ${res.status}`);
  return (await res.json()) as PayPalTokens;
}

export async function refreshPayPalAccessToken(refreshToken: string): Promise<PayPalTokens> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch(`${basePayPal()}/v1/oauth2/token`, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
      'User-Agent': 'Prooved/1.0',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`PayPal refresh failed: ${res.status}`);
  const json = (await res.json()) as Partial<PayPalTokens>;
  return {
    access_token: json.access_token ?? '',
    refresh_token: json.refresh_token ?? refreshToken,
    expires_in: json.expires_in ?? 32400,
  };
}

export interface PayPalUserInfo extends PlatformProfile {
  verifiedName: string | null;
  pictureUrl: string | null;
}

export async function fetchPayPalUserInfo(accessToken: string): Promise<PayPalUserInfo> {
  const res = await fetch(`${basePayPal()}/v1/identity/openidconnect/userinfo?schema=openid`, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Prooved/1.0',
    },
  });
  if (!res.ok) throw new Error(`PayPal userinfo failed: ${res.status}`);
  const json = (await res.json()) as {
    user_id?: string;
    verified_account?: boolean | string;
    name?: string;
    given_name?: string;
    family_name?: string;
    account_type?: string;
    picture?: string;
  };

  // Prefer full `name`, fall back to given+family combined
  const verifiedName =
    json.name?.trim() ||
    [json.given_name, json.family_name].filter(Boolean).join(' ').trim() ||
    null;

  return {
    platformUserId: json.user_id ?? null,
    url: 'https://www.paypal.com',
    ratingScore: null,
    ratingCount: null,
    positiveCount: null,
    negativeCount: null,
    memberSince: null,
    identityVerified: json.verified_account === true || json.verified_account === 'true',
    verifiedName,
    pictureUrl: json.picture?.trim() || null,
  };
}

export const paypalAdapter: PlatformAdapter = {
  platform: 'paypal',
  tier: 'gold',
  method: 'oauth',
  async fetchProfile({ accessToken }) {
    if (!accessToken) throw new Error('PayPal requires accessToken');
    return fetchPayPalUserInfo(accessToken);
  },
};
