import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { getPayPalAuthorizeUrl } from '@/shared/lib/platforms/paypal';
import { randomHex } from '@/shared/lib/crypto';

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const state = `${auth.userId}.${randomHex(8)}`;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/oauth/paypal/callback`;
  const url = getPayPalAuthorizeUrl(state, redirectUri);
  const res = NextResponse.redirect(url);
  res.cookies.set('paypal_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
