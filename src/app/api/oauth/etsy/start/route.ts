import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { createPkce, getEtsyAuthorizeUrl } from '@/shared/lib/platforms/etsy';
import { randomHex } from '@/shared/lib/crypto';

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const { verifier, challenge } = createPkce();
  const state = `${auth.userId}.${randomHex(8)}`;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/oauth/etsy/callback`;

  const url = getEtsyAuthorizeUrl({ state, codeChallenge: challenge, redirectUri });
  const res = NextResponse.redirect(url);

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 600,
    path: '/',
  };
  res.cookies.set('etsy_oauth_state', state, cookieOpts);
  res.cookies.set('etsy_oauth_verifier', verifier, cookieOpts);
  return res;
}
