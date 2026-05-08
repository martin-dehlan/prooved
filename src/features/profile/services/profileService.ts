import { createSupabaseServer } from '@/shared/lib/supabase/server';
import type { Database } from '@/shared/types/database.types';
import type { Connection } from '@/features/connections/types/connection.types';

export type PublicProfile = {
  user: Database['public']['Tables']['users']['Row'];
  connections: Connection[];
};

export type ProfileLookup =
  | { kind: 'ok'; data: PublicProfile }
  | { kind: 'suspended'; slug: string }
  | { kind: 'not_found' };

export async function getPublicProfile(slug: string): Promise<PublicProfile | null> {
  const result = await lookupProfile(slug);
  return result.kind === 'ok' ? result.data : null;
}

export async function lookupProfile(slug: string): Promise<ProfileLookup> {
  const supabase = await createSupabaseServer();

  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (userErr || !user) return { kind: 'not_found' };
  if (user.suspended_at) return { kind: 'suspended', slug };

  const { data: connections, error: connErr } = await supabase
    .from('connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('hidden', false)
    .not('verified_at', 'is', null);
  if (connErr) return { kind: 'not_found' };

  return { kind: 'ok', data: { user, connections: (connections ?? []) as Connection[] } };
}
