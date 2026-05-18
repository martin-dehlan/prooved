import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/shared/lib/api/requireUser';
import { createSupabaseServer } from '@/shared/lib/supabase/server';

const Body = z.object({ email: z.string().email().max(254) });

export async function POST(req: Request) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  const newEmail = parsed.data.email.trim().toLowerCase();
  if (newEmail === auth.email.toLowerCase()) {
    return NextResponse.json({ error: 'same_email' }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  // Triggers Supabase confirmation email to the new address.
  // users.email row sync happens on next login (auth state propagation).
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, pending: newEmail });
}
