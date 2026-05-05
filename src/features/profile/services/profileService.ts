import { createSupabaseServer } from '@/shared/lib/supabase/server';
import type { Database } from '@/shared/types/database.types';
import type { Connection } from '@/features/connections/types/connection.types';

export type PublicProfile = {
  user: Database['public']['Tables']['users']['Row'];
  connections: Connection[];
};

export async function getPublicProfile(slug: string): Promise<PublicProfile | null> {
  const supabase = await createSupabaseServer();

  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (userErr || !user) return null;
  if (user.suspended_at) return null;

  const { data: connections, error: connErr } = await supabase
    .from('connections')
    .select('*')
    .eq('user_id', user.id)
    .not('verified_at', 'is', null);
  if (connErr) return null;

  return { user, connections: (connections ?? []) as Connection[] };
}
