import Link from 'next/link';
import { Card, CardContent } from '@/shared/components/ui';
import { PLATFORM_LABELS, PLATFORM_TIER, PLATFORM_METHOD, TIER_BADGE } from '@/shared/types/platform.types';
import type { Platform } from '@/shared/types/platform.types';

const PLATFORMS: Platform[] = ['ebay', 'paypal', 'vinted', 'kleinanzeigen'];

const METHOD_LABEL = {
  oauth: 'OAuth',
  bio_code: 'Bio-Code',
  scrape: 'Profil-Scan',
} as const;

export function PlatformGrid() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {PLATFORMS.map((p) => (
        <li key={p}>
          <Link href={`/dashboard/connect/${p}`} className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">{PLATFORM_LABELS[p]}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${TIER_BADGE[PLATFORM_TIER[p]].className}`}>
                    {TIER_BADGE[PLATFORM_TIER[p]].label}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Methode: {METHOD_LABEL[PLATFORM_METHOD[p]]}
                </p>
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
