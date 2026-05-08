import { supabase } from '@/shared/lib/supabase/client';
import type { Connection, NewConnection } from '@/features/connections/types/connection.types';
import type { BioCodePlatform } from '@/features/connections/types/connection.schemas';

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

export async function getBioCode(platform: BioCodePlatform): Promise<{ code: string }> {
  const res = await fetch(`/api/connections/start-bio-code?platform=${platform}`);
  if (!res.ok) throw new Error(`Code-Abruf fehlgeschlagen: ${res.status}`);
  return res.json();
}

export async function verifyBioCode(input: {
  platform: BioCodePlatform;
  platformUrl: string;
}): Promise<{ verified: boolean; reason?: string }> {
  const res = await fetch('/api/verify/bio-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { verified: false, reason: data?.error ?? `HTTP ${res.status}` };
  }
  return res.json();
}

export type VisibilityPatch = {
  hidden?: boolean;
  show_name?: boolean;
  show_picture?: boolean;
};

export async function setConnectionVisibility(
  connectionId: string,
  patch: VisibilityPatch,
): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/connections/${connectionId}/visibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Sichtbarkeit-Update fehlgeschlagen: ${res.status}`);
  return res.json();
}

export async function refreshConnection(
  connectionId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const res = await fetch(`/api/refresh/${connectionId}`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.reason ?? `HTTP ${res.status}`);
  }
  if (!data.ok && data.reason) {
    throw new Error(data.reason);
  }
  return data;
}
