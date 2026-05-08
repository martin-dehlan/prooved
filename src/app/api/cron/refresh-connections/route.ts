import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { refreshConnectionData } from '@/features/verify';

// Vercel Cron entry. Authenticated by Authorization: Bearer ${CRON_SECRET}
// Vercel auto-sends this for projects with cron in vercel.json or vercel.ts.
export async function GET(req: Request) {
  // Vercel Cron sends `x-vercel-cron: 1` and Authorization Bearer with CRON_SECRET
  const authHeader = req.headers.get('authorization') ?? '';
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const expected = process.env.CRON_SECRET;
  if (!isVercelCron && (!expected || authHeader !== `Bearer ${expected}`)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  // Refresh oldest first; cap to 200 per run to stay within function timeout
  const { data: rows, error } = await supabase
    .from('connections')
    .select('id, user_id, platform, last_fetched')
    .not('verified_at', 'is', null)
    .order('last_fetched', { ascending: true, nullsFirst: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { id: string; ok: boolean; reason?: string }[] = [];
  for (const r of rows ?? []) {
    const result = await refreshConnectionData({
      userId: r.user_id,
      connectionId: r.id,
    });
    results.push({ id: r.id, ok: result.ok, reason: result.reason });
    // Persist failure reason for UI surfacing
    await supabase
      .from('connections')
      .update({ last_error: result.ok ? null : (result.reason ?? 'unknown error') })
      .eq('id', r.id);
  }

  return NextResponse.json({
    processed: results.length,
    failed: results.filter((r) => !r.ok).length,
  });
}
