// Source: GitHub OAuth + REST API.
// Docs: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
//       https://docs.github.com/en/rest/users/users
//
// Trust signal: account age + public repos + name verified by GitHub.
// No PKCE — uses client_id + client_secret.

import type { PlatformAdapter, PlatformProfile } from '@/shared/types/platform.types';

const GH_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GH_TOKEN = 'https://github.com/login/oauth/access_token';
const GH_API = 'https://api.github.com';

const SCOPES = 'read:user';

export interface GitHubTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

export interface GitHubProfile extends PlatformProfile {
  verifiedName: string | null;
  login: string | null;
}

export function getGitHubAuthorizeUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID ?? '',
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
    allow_signup: 'true',
  });
  return `${GH_AUTHORIZE}?${params.toString()}`;
}

export async function exchangeGitHubCode(
  code: string,
  redirectUri: string,
): Promise<GitHubTokens> {
  const res = await fetch(GH_TOKEN, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID ?? '',
      client_secret: process.env.GITHUB_CLIENT_SECRET ?? '',
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) throw new Error(`GitHub token exchange failed: ${res.status}`);
  return (await res.json()) as GitHubTokens;
}

export async function fetchGitHubProfile(accessToken: string): Promise<GitHubProfile> {
  const res = await fetch(`${GH_API}/user`, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Prooved/1.0',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) throw new Error(`GitHub /user failed: ${res.status}`);
  const u = (await res.json()) as {
    id?: number;
    login?: string;
    name?: string | null;
    html_url?: string;
    created_at?: string;
    public_repos?: number;
    followers?: number;
  };

  return {
    platformUserId: u.id ? String(u.id) : null,
    url: u.html_url ?? (u.login ? `https://github.com/${u.login}` : 'https://github.com'),
    // We display public_repos as the "rating count" — proxy for activity
    ratingScore: null,
    ratingCount: u.public_repos ?? null,
    positiveCount: u.followers ?? null,
    negativeCount: null,
    memberSince: u.created_at ?? null,
    verifiedName: u.name?.trim() || null,
    login: u.login ?? null,
  };
}

export const githubAdapter: PlatformAdapter = {
  platform: 'github',
  tier: 'silver',
  method: 'oauth',
  async fetchProfile({ accessToken }) {
    if (!accessToken) throw new Error('GitHub requires accessToken');
    return fetchGitHubProfile(accessToken);
  },
};
