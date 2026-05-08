// Activity-Log helper — fire-and-forget event recording.
// Visible to user on dashboard; useful forensic trail when account compromised.

import { createSupabaseAdmin } from '@/shared/lib/supabase/server';

export type ActivityKind =
  | 'connection_added'
  | 'connection_removed'
  | 'connection_refreshed'
  | 'connection_hidden'
  | 'connection_shown'
  | 'connection_paused'
  | 'connection_resumed'
  | 'connection_field_toggled'
  | 'rating_drop_detected'
  | 'login'
  | 'profile_updated'
  | 'wallet_connected'
  | 'wallet_disconnected'
  | 'export_generated';

export interface LogActivityArgs {
  userId: string;
  kind: ActivityKind;
  platform?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

export async function logActivity(args: LogActivityArgs): Promise<void> {
  try {
    const supabase = createSupabaseAdmin();
    await supabase.from('activity_log').insert({
      user_id: args.userId,
      kind: args.kind,
      platform: args.platform ?? null,
      // Cast — Json union is stricter than Record<string, unknown>; we trust caller
      metadata: (args.metadata ?? {}) as never,
      ip: args.ip ?? null,
    });
  } catch (e) {
    console.error('[activity] log failed', e);
  }
}
