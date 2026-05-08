import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/shared/lib/api/requireUser';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';

// All three flags optional — caller can patch one or many.
const schema = z.object({
  hidden: z.boolean().optional(),
  show_name: z.boolean().optional(),
  show_picture: z.boolean().optional(),
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
  const { error } = await supabase
    .from('connections')
    .update(update)
    .eq('id', connectionId)
    .eq('user_id', auth.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
