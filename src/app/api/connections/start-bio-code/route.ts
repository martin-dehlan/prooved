import { NextResponse } from 'next/server';
import { requireUser } from '@/shared/lib/api/requireUser';
import { generateBioCode } from '@/shared/lib/utils/bio-code';
import { BIOCODE_PLATFORMS } from '@/features/connections/types/connection.schemas';

const BIOCODE_SET = new Set<string>(BIOCODE_PLATFORMS);

export async function GET(req: Request) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform') ?? '';
  if (!BIOCODE_SET.has(platform)) {
    return NextResponse.json({ error: 'invalid_platform' }, { status: 400 });
  }

  return NextResponse.json({ code: generateBioCode(auth.userId, platform) });
}
