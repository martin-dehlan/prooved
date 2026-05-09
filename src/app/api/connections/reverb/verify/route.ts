import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/shared/lib/api/requireUser';
import { rateLimit, RATE_LIMITS } from '@/shared/lib/rate-limit';
import { fetchReverbProfile } from '@/shared/lib/platforms/reverb';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { encrypt } from '@/shared/lib/crypto';
import { notifyUserOfNewConnection } from '@/shared/lib/email/notify';
import { logActivity } from '@/shared/lib/activity';

const schema = z.object({ token: z.string().min(20).max(500) });

export async function POST(req: Request) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const rl = rateLimit(auth.userId, RATE_LIMITS.bioCodeCheck);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Token-Format ungültig (mind. 20 Zeichen)' },
      { status: 400 },
    );
  }

  let profile;
  try {
    profile = await fetchReverbProfile(parsed.data.token);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? `Reverb-API-Fehler: ${e.message}. Token gültig?`
            : 'Reverb-API-Fehler',
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdmin();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from('connections').upsert(
    {
      user_id: auth.userId,
      platform: 'reverb',
      platform_user_id: profile.platformUserId,
      platform_url: profile.url,
      verify_token: 'token',
      method: 'token',
      tier: 'silver',
      verified_at: now.toISOString(),
      expires_at: expiresAt,
      rating_score: profile.ratingScore,
      rating_count: profile.ratingCount,
      positive_count: profile.positiveCount,
      negative_count: profile.negativeCount,
      member_since: profile.memberSince,
      custom_label: profile.shopName,
      last_fetched: now.toISOString(),
      // Token encrypted exactly like OAuth tokens
      signed_payload: encrypt(JSON.stringify({ access_token: parsed.data.token })),
    },
    { onConflict: 'user_id,platform' },
  );

  void notifyUserOfNewConnection({ userId: auth.userId, platform: 'Reverb' });
  void logActivity({
    userId: auth.userId,
    kind: 'connection_added',
    platform: 'reverb',
  });

  return NextResponse.json({ ok: true });
}
