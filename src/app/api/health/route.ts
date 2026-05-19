import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checks: Record<string, 'ok' | 'fail'> = {
    app: 'ok',
  };

  let dbStatus: 'ok' | 'fail' = 'ok';
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
      dbStatus = 'fail';
    } else {
      const res = await fetch(`${url}/auth/v1/health`, {
        signal: AbortSignal.timeout(3000),
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
      });
      if (!res.ok) dbStatus = 'fail';
    }
  } catch {
    dbStatus = 'fail';
  }
  checks.supabase = dbStatus;

  const allOk = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: allOk ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
