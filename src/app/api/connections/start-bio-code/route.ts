import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { startBioCodeFlow } from '@/features/verify';
import { startBioCodeFlowSchema } from '@/features/connections';

export async function POST(req: Request) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const body = await req.json();
  const parsed = startBioCodeFlowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await startBioCodeFlow({
      userId: auth.userId,
      platform: parsed.data.platform,
      platformUrl: parsed.data.platformUrl,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unknown' },
      { status: 500 },
    );
  }
}
