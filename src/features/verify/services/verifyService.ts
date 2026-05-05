import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { vintedBioContainsCode, extractVintedUserIdFromUrl } from '@/shared/lib/platforms/vinted';
import {
  kleinanzeigenBioContainsCode,
  extractKleinanzeigenIdFromUrl,
} from '@/shared/lib/platforms/kleinanzeigen';
import { generateBioCode, bioCodeBelongsToUser } from '@/shared/lib/utils/bio-code';
import type { Platform } from '@/shared/types/platform.types';

const BIO_CODE_TTL_DAYS = 30;

function expiryFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function startBioCodeFlow(args: {
  userId: string;
  platform: 'vinted' | 'kleinanzeigen';
  platformUrl: string;
}): Promise<{ connectionId: string; bioCode: string }> {
  const supabase = createSupabaseAdmin();
  const code = generateBioCode(args.userId);

  const platformUserId =
    args.platform === 'vinted'
      ? extractVintedUserIdFromUrl(args.platformUrl)
      : extractKleinanzeigenIdFromUrl(args.platformUrl);

  if (!platformUserId) {
    throw new Error('Konnte Profil-ID aus URL nicht extrahieren');
  }

  const { data, error } = await supabase
    .from('connections')
    .upsert(
      {
        user_id: args.userId,
        platform: args.platform,
        platform_user_id: platformUserId,
        platform_url: args.platformUrl,
        verify_token: code,
        method: 'bio_code',
        tier: 'silver',
        verified_at: null,
        expires_at: null,
      },
      { onConflict: 'user_id,platform' },
    )
    .select('id')
    .single();

  if (error || !data) throw error ?? new Error('Insert failed');
  return { connectionId: data.id, bioCode: code };
}

export async function verifyBioCodeForConnection(args: {
  userId: string;
  connectionId: string;
}): Promise<{ verified: boolean; reason?: string }> {
  const supabase = createSupabaseAdmin();
  const { data: conn, error } = await supabase
    .from('connections')
    .select('*')
    .eq('id', args.connectionId)
    .eq('user_id', args.userId)
    .single();

  if (error || !conn) return { verified: false, reason: 'Verbindung nicht gefunden' };
  if (!conn.verify_token || !conn.platform_user_id) {
    return { verified: false, reason: 'Token oder Platform-ID fehlt' };
  }
  if (!bioCodeBelongsToUser(conn.verify_token, args.userId)) {
    return { verified: false, reason: 'Token gehört nicht zum User' };
  }

  let result;
  try {
    if (conn.platform === 'vinted') {
      result = await vintedBioContainsCode(conn.platform_user_id, conn.verify_token);
    } else if (conn.platform === 'kleinanzeigen') {
      result = await kleinanzeigenBioContainsCode(conn.platform_user_id, conn.verify_token);
    } else {
      return { verified: false, reason: 'Plattform nicht bio-code-fähig' };
    }
  } catch (e) {
    return {
      verified: false,
      reason: e instanceof Error ? e.message : 'Plattform-Check fehlgeschlagen',
    };
  }

  if (!result.matched) {
    return { verified: false, reason: 'Code nicht im Profil gefunden' };
  }

  const now = new Date().toISOString();
  await supabase
    .from('connections')
    .update({
      verified_at: now,
      last_fetched: now,
      expires_at: expiryFromNow(BIO_CODE_TTL_DAYS),
      rating_score: result.profile.ratingScore,
      rating_count: result.profile.ratingCount,
      member_since: result.profile.memberSince,
      platform_url: result.profile.url,
    })
    .eq('id', conn.id);

  return { verified: true };
}

export async function refreshConnectionData(args: {
  userId: string;
  connectionId: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const supabase = createSupabaseAdmin();
  const { data: conn, error } = await supabase
    .from('connections')
    .select('*')
    .eq('id', args.connectionId)
    .eq('user_id', args.userId)
    .single();
  if (error || !conn) return { ok: false, reason: 'not found' };

  if (conn.method === 'bio_code') {
    return verifyBioCodeForConnection({
      userId: args.userId,
      connectionId: args.connectionId,
    }).then((r) => ({ ok: r.verified, reason: r.reason }));
  }

  // OAuth refresh handled separately (eBay/PayPal). Phase 1: stub.
  return { ok: false, reason: 'OAuth refresh not implemented yet' };
}

export const __platformsExposed: Platform[] = ['vinted', 'kleinanzeigen'];
