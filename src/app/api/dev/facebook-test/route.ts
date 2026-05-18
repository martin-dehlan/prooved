// Dev-only probe for FB Graph API. Reads FACEBOOK_TEST_TOKEN from env
// and returns parsed profile + raw Marketplace-field probe results.
// Gate: enabled only when FACEBOOK_TEST_TOKEN is set in env. Remove
// FACEBOOK_TEST_TOKEN from Vercel env after the probe is done — that
// also disables this endpoint.

import { NextResponse } from 'next/server';
import { fetchFacebookProfile } from '@/shared/lib/platforms/facebook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function probe(token: string, fields: string) {
  const url = new URL('https://graph.facebook.com/v21.0/me');
  url.searchParams.set('fields', fields);
  url.searchParams.set('access_token', token);
  const res = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': 'Prooved/1.0' },
  });
  const body = await res.json().catch(() => ({ parseError: true }));
  return { status: res.status, body };
}

export async function GET() {
  const token = process.env.FACEBOOK_TEST_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'FACEBOOK_TEST_TOKEN not set — endpoint disabled' },
      { status: 404 },
    );
  }

  try {
    const profile = await fetchFacebookProfile(token);
    const probes = {
      basic: await probe(token, 'id,name,email,picture'),
      marketplace_listings: await probe(token, 'id,marketplace_listings'),
      ratings: await probe(token, 'id,ratings'),
      reviews: await probe(token, 'id,reviews'),
      marketplace_seller_rating: await probe(token, 'id,marketplace_seller_rating'),
    };
    return NextResponse.json({ ok: true, profile, probes }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'unknown' },
      { status: 500 },
    );
  }
}
