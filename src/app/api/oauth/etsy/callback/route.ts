import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeEtsyCode, fetchEtsyShopProfile } from '@/shared/lib/platforms/etsy';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { encrypt } from '@/shared/lib/crypto';
import { notifyUserOfNewConnection } from '@/shared/lib/email/notify';
import { logActivity } from '@/shared/lib/activity';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('etsy_oauth_state')?.value;
  const verifier = cookieStore.get('etsy_oauth_verifier')?.value;

  if (!code || !state || state !== expectedState || !verifier) {
    return NextResponse.json({ error: 'invalid_state' }, { status: 400 });
  }
  const userId = state.split('.')[0];
  if (!userId) return NextResponse.json({ error: 'invalid_state' }, { status: 400 });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? url.origin}/api/oauth/etsy/callback`;

  try {
    const tokens = await exchangeEtsyCode({ code, codeVerifier: verifier, redirectUri });
    const profile = await fetchEtsyShopProfile(tokens.access_token);
    const supabase = createSupabaseAdmin();
    const now = new Date();
    // Etsy refresh tokens last 90 days; access tokens 1h.
    // Treat connection as valid for 90d, silently refresh access in between.
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('connections').upsert(
      {
        user_id: userId,
        platform: 'etsy',
        platform_user_id: profile.platformUserId,
        platform_url: profile.url,
        verify_token: 'oauth',
        method: 'oauth',
        tier: 'gold',
        verified_at: now.toISOString(),
        expires_at: expiresAt,
        rating_score: profile.ratingScore,
        rating_count: profile.ratingCount,
        member_since: profile.memberSince,
        last_fetched: now.toISOString(),
        signed_payload: encrypt(JSON.stringify(tokens)),
      },
      { onConflict: 'user_id,platform' },
    );

    void notifyUserOfNewConnection({ userId, platform: 'Etsy' });
    void logActivity({ userId, kind: 'connection_added', platform: 'etsy' });
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
