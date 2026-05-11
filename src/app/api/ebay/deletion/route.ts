// Source: eBay Marketplace Account Deletion / Closure Notifications
// Docs: https://developer.ebay.com/marketplace-account-deletion
//
// GET  — eBay challenge: returns SHA-256(challengeCode + verificationToken + endpointURL).
// POST — deletion notification: removes the affected eBay connection.

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createSupabaseAdmin } from '@/shared/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function endpointUrl(): string {
  return (
    process.env.EBAY_DELETION_ENDPOINT_URL ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://prooved.xyz'}/api/ebay/deletion`
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const challengeCode = url.searchParams.get('challenge_code');
  const token = process.env.EBAY_DELETION_VERIFICATION_TOKEN;
  if (!challengeCode || !token) {
    console.warn('[ebay-deletion] challenge failed', { hasChallenge: !!challengeCode, hasToken: !!token });
    return NextResponse.json({ error: 'missing_challenge_or_token' }, { status: 400 });
  }
  const hash = createHash('sha256')
    .update(challengeCode)
    .update(token)
    .update(endpointUrl())
    .digest('hex');
  console.log('[ebay-deletion] challenge ok');
  return NextResponse.json({ challengeResponse: hash }, { status: 200 });
}

export async function POST(req: Request) {
  // Always 200 — eBay retries on non-200 even for bad payloads.
  try {
    const body = (await req.json().catch(() => null)) as
      | { notification?: { notificationId?: string; data?: { username?: string; userId?: string; eiasToken?: string } } }
      | null;
    const data = body?.notification?.data;
    const ebayUserId = data?.username ?? data?.userId;
    console.log('[ebay-deletion] notification', {
      id: body?.notification?.notificationId,
      hasUser: !!ebayUserId,
    });
    if (ebayUserId) {
      const supabase = createSupabaseAdmin();
      const { error, count } = await supabase
        .from('connections')
        .delete({ count: 'exact' })
        .eq('platform', 'ebay')
        .eq('platform_user_id', ebayUserId);
      if (error) console.error('[ebay-deletion] delete failed', error);
      else console.log('[ebay-deletion] deleted', { count });
    }
  } catch (e) {
    console.error('[ebay-deletion] handler crashed', e);
  }
  return new NextResponse(null, { status: 200 });
}
