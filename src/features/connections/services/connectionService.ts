import { supabase } from '@/shared/lib/supabase/client';
import type { Connection, NewConnection } from '@/features/connections/types/connection.types';

export async function listMyConnections(userId: string): Promise<Connection[]> {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Connection[];
}

export async function listPublicConnections(userId: string): Promise<Connection[]> {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('user_id', userId)
    .not('verified_at', 'is', null)
    .order('tier', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Connection[];
}

export async function upsertConnection(input: NewConnection): Promise<Connection> {
  const { data, error } = await supabase
    .from('connections')
    .upsert(input, { onConflict: 'user_id,platform' })
    .select('*')
    .single();
  if (error) throw error;
  return data as Connection;
}

export async function deleteConnection(id: string): Promise<void> {
  const { error } = await supabase.from('connections').delete().eq('id', id);
  if (error) throw error;
}

export async function startBioCodeFlow(input: {
  platform: 'vinted' | 'kleinanzeigen';
  platformUrl: string;
}): Promise<{ connectionId: string; bioCode: string }> {
  const res = await fetch('/api/connections/start-bio-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Bio-Code Start fehlgeschlagen: ${res.status}`);
  return res.json();
}

export async function verifyBioCode(connectionId: string): Promise<{ verified: boolean }> {
  const res = await fetch('/api/verify/bio-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connectionId }),
  });
  if (!res.ok) throw new Error(`Verifizierung fehlgeschlagen: ${res.status}`);
  return res.json();
}

export async function refreshConnection(connectionId: string): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/refresh/${connectionId}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Refresh fehlgeschlagen: ${res.status}`);
  return res.json();
}
