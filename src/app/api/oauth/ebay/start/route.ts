import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { getEbayAuthorizeUrl } from '@/shared/lib/platforms/ebay';
import { randomHex } from '@/shared/lib/crypto';

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  // state = userId|nonce — verified in callback. For prod use a signed token / Redis.
  const state = `${auth.userId}.${randomHex(8)}`;
  const url = getEbayAuthorizeUrl(state);
  const res = NextResponse.redirect(url);
  res.cookies.set('ebay_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
