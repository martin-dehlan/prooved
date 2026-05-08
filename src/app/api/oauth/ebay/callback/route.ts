import { NextResponse } from 'next/server';
import { exchangeEbayCode, fetchEbayFeedback } from '@/shared/lib/platforms/ebay';
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
  const expected = cookieStore.get('ebay_oauth_state')?.value;

  if (!code || !state || state !== expected) {
    return NextResponse.json({ error: 'invalid_state' }, { status: 400 });
  }
  const userId = state.split('.')[0];
  if (!userId) return NextResponse.json({ error: 'invalid_state' }, { status: 400 });

  try {
    const tokens = await exchangeEbayCode(code);
    const profile = await fetchEbayFeedback(tokens.access_token);
    const supabase = createSupabaseAdmin();
    const now = new Date();
    // Connection validity = refresh_token TTL (sandbox ~18mo, live ~18mo).
    // access_token TTL is short and silently refreshed when stale.
    const refreshTtl = tokens.refresh_token_expires_in ?? 365 * 24 * 60 * 60;
    const expiresAt = new Date(now.getTime() + refreshTtl * 1000).toISOString();

    await supabase.from('connections').upsert(
      {
        user_id: userId,
        platform: 'ebay',
        platform_user_id: profile.platformUserId,
        platform_url: profile.url,
        verify_token: 'oauth',
        method: 'oauth',
        tier: 'gold',
        verified_at: now.toISOString(),
        expires_at: expiresAt,
        rating_score: profile.ratingScore,
        rating_count: profile.ratingCount,
        positive_count: profile.positiveCount,
        negative_count: profile.negativeCount,
        member_since: profile.memberSince,
        last_fetched: now.toISOString(),
        signed_payload: encrypt(JSON.stringify(tokens)),
      },
      { onConflict: 'user_id,platform' },
    );

    void notifyUserOfNewConnection({ userId, platform: 'eBay' });
    void logActivity({ userId, kind: 'connection_added', platform: 'ebay' });
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL ?? url.origin));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'oauth_failed' },
      { status: 500 },
    );
  }
}
