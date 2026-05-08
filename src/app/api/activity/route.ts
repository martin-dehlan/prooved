import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';

// Last 30 events for current user — RLS-protected.
export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('activity_log')
    .select('id, kind, platform, metadata, created_at')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data ?? [] });
}
