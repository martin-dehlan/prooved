// Source: LinkedIn OAuth 2.0 (OpenID Connect "Sign In with LinkedIn v2").
// Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
// Trust: KYC-grade real name + LinkedIn profile URL.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const LI_AUTHORIZE = 'https://www.linkedin.com/oauth/v2/authorization';
const LI_TOKEN = 'https://www.linkedin.com/oauth/v2/accessToken';
const LI_USERINFO = 'https://api.linkedin.com/v2/userinfo';
const SCOPES = 'openid profile email';

export interface LinkedInTokens {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type?: string;
  id_token?: string;
}

export interface LinkedInProfile extends PlatformProfile {
  verifiedName: string | null;
  pictureUrl: string | null;
}

export function getLinkedInAuthorizeUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID ?? '',
    redirect_uri: redirectUri,
    state,
    scope: SCOPES,
  });
  return `${LI_AUTHORIZE}?${params.toString()}`;
}

export async function exchangeLinkedInCode(
  code: string,
  redirectUri: string,
): Promise<LinkedInTokens> {
  const res = await fetch(LI_TOKEN, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.LINKEDIN_CLIENT_ID ?? '',
      client_secret: process.env.LINKEDIN_CLIENT_SECRET ?? '',
    }),
  });
  if (!res.ok) throw new Error(`LinkedIn token exchange failed: ${res.status}`);
  return (await res.json()) as LinkedInTokens;
}

export async function fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const res = await fetch(LI_USERINFO, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Prooved/1.0',
    },
  });
  if (!res.ok) throw new Error(`LinkedIn userinfo failed: ${res.status}`);
  const u = (await res.json()) as {
    sub?: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
    email_verified?: boolean;
    picture?: string;
  };
  const verifiedName =
    u.name?.trim() ||
    [u.given_name, u.family_name].filter(Boolean).join(' ').trim() ||
    null;
  return {
    platformUserId: u.sub ?? null,
    url: 'https://www.linkedin.com',
    ratingScore: null,
    ratingCount: null,
    positiveCount: null,
    negativeCount: null,
    memberSince: null,
    identityVerified: u.email_verified === true,
    verifiedName,
    pictureUrl: u.picture?.trim() || null,
  };
}

export const linkedinAdapter: PlatformAdapter = {
  platform: 'linkedin',
  tier: 'gold',
  method: 'oauth',
  async fetchProfile({ accessToken }) {
    if (!accessToken) throw new Error('LinkedIn requires accessToken');
    return fetchLinkedInProfile(accessToken);
  },
};
