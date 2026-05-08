import { NextResponse } from 'next/server';
import { exchangePayPalCode, fetchPayPalUserInfo } from '@/shared/lib/platforms/paypal';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { encrypt } from '@/shared/lib/crypto';
import { notifyUserOfNewConnection } from '@/shared/lib/email/notify';
import { logActivity } from '@/shared/lib/activity';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieStore = await cookies();
  const expected = cookieStore.get('paypal_oauth_state')?.value;

  if (!code || !state || state !== expected) {
    return NextResponse.json({ error: 'invalid_state' }, { status: 400 });
  }
  const userId = state.split('.')[0];
  if (!userId) return NextResponse.json({ error: 'invalid_state' }, { status: 400 });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? url.origin}/api/oauth/paypal/callback`;

  try {
    const tokens = await exchangePayPalCode(code, redirectUri);
    const profile = await fetchPayPalUserInfo(tokens.access_token);
    const supabase = createSupabaseAdmin();
    const now = new Date();
    // PayPal refresh tokens don't expose expiry — treat connection as valid for 1 year,
    // access_token is silently refreshed via refresh_token when stale.
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('connections').upsert(
      {
        user_id: userId,
        platform: 'paypal',
        platform_user_id: profile.platformUserId,
        platform_url: profile.url,
        verify_token: 'oauth',
        method: 'oauth',
        tier: 'gold',
        verified_at: now.toISOString(),
        expires_at: expiresAt,
        rating_score: null,
        rating_count: null,
        positive_count: null,
        negative_count: null,
        member_since: null,
        verified_name: profile.verifiedName,
        verified_picture_url: profile.pictureUrl,
        last_fetched: now.toISOString(),
        signed_payload: encrypt(JSON.stringify(tokens)),
      },
      { onConflict: 'user_id,platform' },
    );

    void notifyUserOfNewConnection({ userId, platform: 'PayPal' });
    void logActivity({ userId, kind: 'connection_added', platform: 'paypal' });
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL ?? url.origin));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'oauth_failed' },
      { status: 500 },
    );
  }
}
