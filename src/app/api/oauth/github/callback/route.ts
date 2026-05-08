import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeGitHubCode, fetchGitHubProfile } from '@/shared/lib/platforms/github';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { encrypt } from '@/shared/lib/crypto';
import { notifyUserOfNewConnection } from '@/shared/lib/email/notify';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieStore = await cookies();
  const expected = cookieStore.get('github_oauth_state')?.value;

  if (!code || !state || state !== expected) {
    return NextResponse.json({ error: 'invalid_state' }, { status: 400 });
  }
  const userId = state.split('.')[0];
  if (!userId) return NextResponse.json({ error: 'invalid_state' }, { status: 400 });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? url.origin}/api/oauth/github/callback`;

  try {
    const tokens = await exchangeGitHubCode(code, redirectUri);
    const profile = await fetchGitHubProfile(tokens.access_token);
    const supabase = createSupabaseAdmin();
    const now = new Date();
    // GitHub access tokens for OAuth apps don't expire by default
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('connections').upsert(
      {
        user_id: userId,
        platform: 'github',
        platform_user_id: profile.login ?? profile.platformUserId,
        platform_url: profile.url,
        verify_token: 'oauth',
        method: 'oauth',
        tier: 'silver',
        verified_at: now.toISOString(),
        expires_at: expiresAt,
        rating_score: null,
        rating_count: profile.ratingCount,
        positive_count: profile.positiveCount,
        member_since: profile.memberSince,
        verified_name: profile.verifiedName,
        last_fetched: now.toISOString(),
        signed_payload: encrypt(JSON.stringify(tokens)),
      },
      { onConflict: 'user_id,platform' },
    );

    void notifyUserOfNewConnection({ userId, platform: 'GitHub' });
    return NextResponse.redirect(
      new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL ?? url.origin),
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'oauth_failed' },
      { status: 500 },
    );
  }
}
