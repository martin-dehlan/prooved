import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { refreshConnectionData } from '@/features/verify';
import { logActivity } from '@/shared/lib/activity';

// Vercel Cron entry. Authenticated via x-vercel-cron header (set automatically
// by Vercel for projects with cron in vercel.json) or Bearer ${CRON_SECRET}.
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') ?? '';
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const expected = process.env.CRON_SECRET;
  if (!isVercelCron && (!expected || authHeader !== `Bearer ${expected}`)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  // Pull pre-refresh snapshot for trend detection. Paused connections skip.
  const { data: rows, error } = await supabase
    .from('connections')
    .select(
      'id, user_id, platform, last_fetched, rating_score, rating_count, positive_count, negative_count',
    )
    .not('verified_at', 'is', null)
    .eq('paused', false)
    .order('last_fetched', { ascending: true, nullsFirst: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let drops = 0;
  const results: { id: string; ok: boolean; reason?: string }[] = [];

  for (const before of rows ?? []) {
    const result = await refreshConnectionData({
      userId: before.user_id,
      connectionId: before.id,
    });
    results.push({ id: before.id, ok: result.ok, reason: result.reason });

    // Persist failure reason
    await supabase
      .from('connections')
      .update({ last_error: result.ok ? null : (result.reason ?? 'unknown error') })
      .eq('id', before.id);

    // Trend detection — fetch after-state, compare
    if (result.ok) {
      const { data: after } = await supabase
        .from('connections')
        .select('rating_score, rating_count, negative_count')
        .eq('id', before.id)
        .maybeSingle();

      if (after && isSuspiciousDrop(before, after)) {
        drops += 1;
        void logActivity({
          userId: before.user_id,
          kind: 'rating_drop_detected',
          platform: before.platform,
          metadata: {
            before: {
              score: before.rating_score,
              count: before.rating_count,
              negative: before.negative_count,
            },
            after: {
              score: after.rating_score,
              count: after.rating_count,
              negative: after.negative_count,
            },
          },
        });
      }
    }
  }

  return NextResponse.json({
    processed: results.length,
    failed: results.filter((r) => !r.ok).length,
    drops,
  });
}

/**
 * Flags meaningful regressions only:
 *   - rating_score drop ≥ 0.3 (1-5 scale)
 *   - new negatives appeared (≥3 more)
 * Skips noise from cold-start where 'before' was null.
 */
function isSuspiciousDrop(
  before: {
    rating_score: number | null;
    rating_count: number | null;
    negative_count: number | null;
  },
  after: {
    rating_score: number | null;
    negative_count: number | null;
  },
): boolean {
  const scoreDrop =
    before.rating_score != null &&
    after.rating_score != null &&
    before.rating_score - after.rating_score >= 0.3;

  const negJump =
    before.negative_count != null &&
    after.negative_count != null &&
    after.negative_count - before.negative_count >= 3;

  return scoreDrop || negJump;
}
