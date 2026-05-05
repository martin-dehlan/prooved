import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';

export async function POST() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const supabase = createSupabaseAdmin();
  // Cascade deletes connections, reports, wallet_proofs, data_exports via FK ON DELETE CASCADE.
  await supabase.from('users').delete().eq('id', auth.userId);
  // Best-effort delete of auth user. Requires service-role key.
  await supabase.auth.admin.deleteUser(auth.userId);

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'));
}
