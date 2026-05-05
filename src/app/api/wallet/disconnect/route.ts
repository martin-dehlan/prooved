import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { disconnectWallet } from '@/features/wallet';

export async function POST() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  await disconnectWallet(auth.userId);
  return NextResponse.redirect(new URL('/dashboard/privacy', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'));
}
