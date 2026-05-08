import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/shared/lib/api/requireUser';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { logActivity, type ActivityKind } from '@/shared/lib/activity';

const schema = z.object({
  hidden: z.boolean().optional(),
  show_name: z.boolean().optional(),
  show_picture: z.boolean().optional(),
  paused: z.boolean().optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ connectionId: string }> },
) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const update = parsed.data;
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no_fields' }, { status: 400 });
  }

  const { connectionId } = await ctx.params;
  const supabase = createSupabaseAdmin();

  // Fetch existing for activity log + platform info
  const { data: existing } = await supabase
    .from('connections')
    .select('platform')
    .eq('id', connectionId)
    .eq('user_id', auth.userId)
    .maybeSingle();

  const { error } = await supabase
    .from('connections')
    .update(update)
    .eq('id', connectionId)
    .eq('user_id', auth.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log a single best-fit kind
  let kind: ActivityKind | null = null;
  if (update.hidden === true) kind = 'connection_hidden';
  else if (update.hidden === false) kind = 'connection_shown';
  else if (update.paused === true) kind = 'connection_paused';
  else if (update.paused === false) kind = 'connection_resumed';
  else if (update.show_name !== undefined || update.show_picture !== undefined) {
    kind = 'connection_field_toggled';
  }
  if (kind) {
    void logActivity({
      userId: auth.userId,
      kind,
      platform: existing?.platform,
      metadata: update,
    });
  }

  return NextResponse.json({ ok: true });
}
