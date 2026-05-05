// Source: eBay OAuth + Trading API (GetFeedback)
// Docs: https://developer.ebay.com/api-docs/static/oauth-tokens.html
//       https://developer.ebay.com/devzone/xml/docs/reference/ebay/GetFeedback.html

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const EBAY_OAUTH = 'https://api.ebay.com/identity/v1/oauth2/token';
const EBAY_OAUTH_SANDBOX = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
const EBAY_AUTHORIZE = 'https://auth.ebay.com/oauth2/authorize';
const EBAY_AUTHORIZE_SANDBOX = 'https://auth.sandbox.ebay.com/oauth2/authorize';

const SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
  'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
].join(' ');

function isProd() {
  return process.env.EBAY_ENV === 'live';
}

export function getEbayAuthorizeUrl(state: string): string {
  const base = isProd() ? EBAY_AUTHORIZE : EBAY_AUTHORIZE_SANDBOX;
  const params = new URLSearchParams({
    client_id: process.env.EBAY_APP_ID ?? '',
    response_type: 'code',
    redirect_uri: process.env.EBAY_RUNAME ?? '',
    scope: SCOPES,
    state,
  });
  return `${base}?${params.toString()}`;
}

export async function exchangeEbayCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const url = isProd() ? EBAY_OAUTH : EBAY_OAUTH_SANDBOX;
  const auth = Buffer.from(`${process.env.EBAY_APP_ID}:${process.env.EBAY_CERT_ID}`).toString('base64');
  const res = await fetch(url, {
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
      redirect_uri: process.env.EBAY_RUNAME ?? '',
    }),
  });
  if (!res.ok) throw new Error(`eBay token exchange failed: ${res.status}`);
  return (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
}

// Trading API GetFeedback. SOAP-XML, but tiny payload.
export async function fetchEbayFeedback(accessToken: string): Promise<PlatformProfile> {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<GetFeedbackRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <DetailLevel>ReturnAll</DetailLevel>
</GetFeedbackRequest>`;

  const res = await fetch('https://api.ebay.com/ws/api.dll', {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: {
      'Content-Type': 'text/xml',
      'X-EBAY-API-COMPATIBILITY-LEVEL': '1193',
      'X-EBAY-API-CALL-NAME': 'GetFeedback',
      'X-EBAY-API-SITEID': '77', // DE
      'X-EBAY-API-IAF-TOKEN': accessToken,
      'User-Agent': 'Prooved/1.0',
    },
    body: xml,
  });
  if (!res.ok) throw new Error(`eBay GetFeedback failed: ${res.status}`);
  const text = await res.text();

  const score = Number(text.match(/<FeedbackScore>(\d+)<\/FeedbackScore>/)?.[1] ?? '0');
  const positive = Number(text.match(/<UniquePositiveFeedbackCount>(\d+)<\/UniquePositiveFeedbackCount>/)?.[1] ?? '0');
  const negative = Number(text.match(/<UniqueNegativeFeedbackCount>(\d+)<\/UniqueNegativeFeedbackCount>/)?.[1] ?? '0');
  const userId = text.match(/<UserID>([^<]+)<\/UserID>/)?.[1] ?? null;
  const memberSince = text.match(/<RegistrationDate>([^<]+)<\/RegistrationDate>/)?.[1] ?? null;

  return {
    platformUserId: userId,
    url: userId ? `https://www.ebay.de/usr/${userId}` : '',
    ratingScore: score > 0 ? score : null,
    ratingCount: score,
    positiveCount: positive,
    negativeCount: negative,
    memberSince,
  };
}

export const ebayAdapter: PlatformAdapter = {
  platform: 'ebay',
  tier: 'gold',
  method: 'oauth',
  async fetchProfile({ accessToken }) {
    if (!accessToken) throw new Error('eBay requires accessToken');
    return fetchEbayFeedback(accessToken);
  },
};
