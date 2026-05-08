import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/shared/lib/api/requireUser';
import { rateLimit, RATE_LIMITS } from '@/shared/lib/rate-limit';
import { generateBioCode } from '@/shared/lib/utils/bio-code';
import {
  domainHasVerifyToken,
  normalizeDomain,
} from '@/shared/lib/platforms/website';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';
import { notifyUserOfNewConnection } from '@/shared/lib/email/notify';
import { logActivity } from '@/shared/lib/activity';

const schema = z.object({ domain: z.string().min(3).max(255) });

export async function POST(req: Request) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const rl = rateLimit(auth.userId, RATE_LIMITS.bioCodeCheck);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, reason: 'rate_limited' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: 'Ungültiges Eingabeformat' },
      { status: 400 },
    );
  }

  const domain = normalizeDomain(parsed.data.domain);
  if (!domain) {
    return NextResponse.json(
      { ok: false, reason: 'Domain-Format ungültig (z.B. example.de)' },
      { status: 400 },
    );
  }

  const code = generateBioCode(auth.userId, 'website');
  const { matched, foundRecords } = await domainHasVerifyToken(domain, code);

  if (!matched) {
    return NextResponse.json({
      ok: false,
      reason:
        foundRecords.length === 0
          ? `Kein TXT-Record auf ${domain} gefunden. DNS-Propagation kann bis zu 1h dauern.`
          : `Code im TXT-Record nicht gefunden. Erwartet: prooved-verify=${code}`,
    });
  }

  const supabase = createSupabaseAdmin();
  const now = new Date();
  await supabase.from('connections').upsert(
    {
      user_id: auth.userId,
      platform: 'website',
      platform_user_id: domain,
      platform_url: `https://${domain}`,
      verify_token: code,
      method: 'domain_dns',
      tier: 'silver',
      verified_at: now.toISOString(),
      // Domain ownership doesn't expire intrinsically — re-check yearly
      expires_at: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      last_fetched: now.toISOString(),
    },
    { onConflict: 'user_id,platform' },
  );

  void notifyUserOfNewConnection({ userId: auth.userId, platform: 'Website' });
  void logActivity({ userId: auth.userId, kind: 'connection_added', platform: 'website', metadata: { domain } });
  return NextResponse.json({ ok: true });
}
