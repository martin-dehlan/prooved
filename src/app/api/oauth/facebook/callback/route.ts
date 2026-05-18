import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  exchangeFacebookCode,
  exchangeForLongLivedToken,
  fetchFacebookProfile,
} from '@/shared/lib/platforms/facebook';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { encrypt } from '@/shared/lib/crypto';
import { notifyUserOfNewConnection } from '@/shared/lib/email/notify';
import { logActivity } from '@/shared/lib/activity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieStore = await cookies();
  const expected = cookieStore.get('facebook_oauth_state')?.value;

  if (!code || !state || state !== expected) {
    return NextResponse.json({ error: 'invalid_state' }, { status: 400 });
  }
  const userId = state.split('.')[0];
  if (!userId) return NextResponse.json({ error: 'invalid_state' }, { status: 400 });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? url.origin}/api/oauth/facebook/callback`;

  try {
    const shortTokens = await exchangeFacebookCode(code, redirectUri);
    // Upgrade short-lived (~1-2h) → long-lived (~60d) so re-fetch cron has runway.
    const tokens = await exchangeForLongLivedToken(shortTokens.access_token);
    const profile = await fetchFacebookProfile(tokens.access_token);
    const supabase = createSupabaseAdmin();
    const now = new Date();
    const ttl = tokens.expires_in ?? 60 * 24 * 60 * 60;
    const expiresAt = new Date(now.getTime() + ttl * 1000).toISOString();

    await supabase.from('connections').upsert(
      {
        user_id: userId,
        platform: 'facebook',
        platform_user_id: profile.platformUserId,
        platform_url: profile.url,
        verify_token: 'oauth',
        method: 'oauth',
        tier: 'silver',
        verified_at: now.toISOString(),
        expires_at: expiresAt,
        verified_name: profile.verifiedName,
        verified_picture_url: profile.pictureUrl,
        last_fetched: now.toISOString(),
        signed_payload: encrypt(JSON.stringify(tokens)),
      },
      { onConflict: 'user_id,platform' },
    );

    void notifyUserOfNewConnection({ userId, platform: 'Facebook' });
    void logActivity({ userId, kind: 'connection_added', platform: 'facebook' });
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
