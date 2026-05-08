import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import {
  vintedBioContainsCode,
  extractVintedUserIdFromUrl,
} from '@/shared/lib/platforms/vinted';
import {
  kleinanzeigenSourceContainsCode,
  resolveKleinanzeigenSource,
  type KleinanzeigenSource,
} from '@/shared/lib/platforms/kleinanzeigen';
import {
  refreshEbayAccessToken,
  fetchEbayFeedback,
  type EbayTokens,
} from '@/shared/lib/platforms/ebay';
import {
  refreshPayPalAccessToken,
  fetchPayPalUserInfo,
  type PayPalTokens,
} from '@/shared/lib/platforms/paypal';
import {
  refreshEtsyAccessToken,
  fetchEtsyShopProfile,
  type EtsyTokens,
} from '@/shared/lib/platforms/etsy';
import {
  fetchGitHubProfile,
  type GitHubTokens,
} from '@/shared/lib/platforms/github';
import {
  discogsBioContainsCode,
  extractDiscogsUsername,
} from '@/shared/lib/platforms/discogs';
import {
  willhabenBioContainsCode,
  extractWillhabenIdFromUrl,
} from '@/shared/lib/platforms/willhaben';
import {
  shpockSourceContainsCode,
  resolveShpockSource,
} from '@/shared/lib/platforms/shpock';
import type { BioCodePlatform } from '@/features/connections/types/connection.schemas';
import { encrypt, decrypt } from '@/shared/lib/crypto';
import { generateBioCode } from '@/shared/lib/utils/bio-code';
import { notifyUserOfNewConnection } from '@/shared/lib/email/notify';
import { logActivity } from '@/shared/lib/activity';
import type { Platform } from '@/shared/types/platform.types';

const BIO_CODE_TTL_DAYS = 30;

function expiryFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Single-step verify: user submits a URL containing the bio code.
 * We resolve the URL → fetch HTML → check code presence → upsert verified connection.
 */
export async function verifyBioCodeBySource(args: {
  userId: string;
  platform: BioCodePlatform;
  platformUrl: string;
}): Promise<{ verified: boolean; reason?: string }> {
  const code = generateBioCode(args.userId, args.platform);

  let platformUserId: string;
  let result: { matched: boolean; profile: import('@/shared/types/platform.types').PlatformProfile };

  try {
    if (args.platform === 'vinted') {
      const id = extractVintedUserIdFromUrl(args.platformUrl);
      if (!id) return { verified: false, reason: 'URL ungültig — erwarte vinted.de/member/<id>' };
      platformUserId = id;
      result = await vintedBioContainsCode(id, code);
    } else if (args.platform === 'kleinanzeigen') {
      const source = await resolveKleinanzeigenSource(args.platformUrl);
      platformUserId = source.userId;
      result = await kleinanzeigenSourceContainsCode(source, code);
    } else if (args.platform === 'discogs') {
      const id = extractDiscogsUsername(args.platformUrl);
      if (!id) return { verified: false, reason: 'Discogs-Username oder Profil-URL ungültig' };
      platformUserId = id;
      result = await discogsBioContainsCode(id, code);
    } else if (args.platform === 'willhaben') {
      const id = extractWillhabenIdFromUrl(args.platformUrl);
      if (!id) return { verified: false, reason: 'URL ungültig — erwarte willhaben.at/seller-profile/...' };
      platformUserId = id;
      result = await willhabenBioContainsCode(id, code);
    } else {
      // shpock — accept listing OR profile URL, resolve to userId server-side
      const source = await resolveShpockSource(args.platformUrl);
      platformUserId = source.userId;
      result = await shpockSourceContainsCode(source, code);
    }
  } catch (e) {
    return {
      verified: false,
      reason: e instanceof Error ? e.message : 'Plattform-Check fehlgeschlagen',
    };
  }

  if (!result.matched) {
    return {
      verified: false,
      reason: 'Code in deinem Profil/Anzeige noch nicht gefunden. Speichern + erneut versuchen.',
    };
  }

  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('connections')
    .upsert(
      {
        user_id: args.userId,
        platform: args.platform,
        platform_user_id: platformUserId,
        platform_url: result.profile.url,
        verify_token: code,
        method: 'bio_code',
        tier: 'silver',
        verified_at: now,
        last_fetched: now,
        expires_at: expiryFromNow(BIO_CODE_TTL_DAYS),
        rating_score: result.profile.ratingScore,
        rating_count: result.profile.ratingCount,
        positive_count: result.profile.positiveCount,
        negative_count: result.profile.negativeCount,
        member_since: result.profile.memberSince,
      },
      { onConflict: 'user_id,platform' },
    );

  if (error) return { verified: false, reason: `DB-Fehler: ${error.message}` };
  void notifyUserOfNewConnection({ userId: args.userId, platform: args.platform });
  void logActivity({
    userId: args.userId,
    kind: 'connection_added',
    platform: args.platform,
  });
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

  if (conn.method === 'bio_code' && conn.platform_url) {
    if (conn.platform !== 'vinted' && conn.platform !== 'kleinanzeigen') {
      return { ok: false, reason: 'unsupported platform' };
    }
    const r = await verifyBioCodeBySource({
      userId: args.userId,
      platform: conn.platform,
      platformUrl: conn.platform_url,
    });
    return { ok: r.verified, reason: r.reason };
  }

  if (conn.method === 'oauth' && conn.signed_payload) {
    const r = await refreshOAuthConnection(args.userId, conn.id, conn.platform, conn.signed_payload);
    if (r.ok) {
      void logActivity({
        userId: args.userId,
        kind: 'connection_refreshed',
        platform: conn.platform,
      });
    }
    return r;
  }

  return { ok: false, reason: 'cannot refresh this connection' };
}

async function refreshOAuthConnection(
  userId: string,
  connectionId: string,
  platform: string,
  encryptedPayload: string,
): Promise<{ ok: boolean; reason?: string }> {
  const supabase = createSupabaseAdmin();

  let oldTokens: EbayTokens | PayPalTokens | EtsyTokens | GitHubTokens;
  try {
    oldTokens = JSON.parse(decrypt(encryptedPayload));
  } catch {
    return { ok: false, reason: 'token decrypt failed' };
  }

  const refreshToken = oldTokens.refresh_token;
  if (!refreshToken) return { ok: false, reason: 'no refresh_token stored' };

  try {
    const now = new Date();
    if (platform === 'ebay') {
      const tokens = await refreshEbayAccessToken(refreshToken);
      const profile = await fetchEbayFeedback(tokens.access_token);
      const refreshTtl = tokens.refresh_token_expires_in ?? 365 * 24 * 60 * 60;
      await supabase
        .from('connections')
        .update({
          last_fetched: now.toISOString(),
          expires_at: new Date(now.getTime() + refreshTtl * 1000).toISOString(),
          rating_score: profile.ratingScore,
          rating_count: profile.ratingCount,
          positive_count: profile.positiveCount,
          negative_count: profile.negativeCount,
          member_since: profile.memberSince,
          signed_payload: encrypt(JSON.stringify(tokens)),
        })
        .eq('id', connectionId)
        .eq('user_id', userId);
      return { ok: true };
    }

    if (platform === 'paypal') {
      const tokens = await refreshPayPalAccessToken(refreshToken);
      const profile = await fetchPayPalUserInfo(tokens.access_token);
      await supabase
        .from('connections')
        .update({
          last_fetched: now.toISOString(),
          expires_at: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          platform_user_id: profile.platformUserId,
          verified_name: profile.verifiedName,
          verified_picture_url: profile.pictureUrl,
          signed_payload: encrypt(JSON.stringify(tokens)),
        })
        .eq('id', connectionId)
        .eq('user_id', userId);
      return { ok: true };
    }

    if (platform === 'github') {
      // GitHub OAuth tokens don't expire by default — re-fetch with stored access_token
      const accessToken = (oldTokens as GitHubTokens).access_token;
      const profile = await fetchGitHubProfile(accessToken);
      await supabase
        .from('connections')
        .update({
          last_fetched: now.toISOString(),
          rating_count: profile.ratingCount,
          positive_count: profile.positiveCount,
          member_since: profile.memberSince,
          platform_url: profile.url,
          platform_user_id: profile.login ?? profile.platformUserId,
          verified_name: profile.verifiedName,
        })
        .eq('id', connectionId)
        .eq('user_id', userId);
      return { ok: true };
    }

    if (platform === 'etsy') {
      const tokens = await refreshEtsyAccessToken(refreshToken);
      const profile = await fetchEtsyShopProfile(tokens.access_token);
      await supabase
        .from('connections')
        .update({
          last_fetched: now.toISOString(),
          expires_at: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          rating_score: profile.ratingScore,
          rating_count: profile.ratingCount,
          member_since: profile.memberSince,
          platform_url: profile.url,
          platform_user_id: profile.platformUserId,
          signed_payload: encrypt(JSON.stringify(tokens)),
        })
        .eq('id', connectionId)
        .eq('user_id', userId);
      return { ok: true };
    }

    return { ok: false, reason: `oauth refresh not supported for ${platform}` };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'refresh failed' };
  }
}

export const __platformsExposed: Platform[] = ['vinted', 'kleinanzeigen'];
// Surface for use by code that imports KleinanzeigenSource type
export type { KleinanzeigenSource };
