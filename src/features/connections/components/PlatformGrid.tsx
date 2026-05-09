import Link from 'next/link';
import {
  PLATFORM_LABELS,
  PLATFORM_TIER,
  PLATFORM_METHOD,
} from '@/shared/types/platform.types';
import type { Platform } from '@/shared/types/platform.types';
import { PlatformIcon } from '@/shared/components/ui/PlatformIcon';

const PLATFORMS: Platform[] = [
  'ebay', 'paypal', 'etsy', 'vinted', 'kleinanzeigen',
  'willhaben', 'shpock', 'discogs',
  'linkedin', 'github',
  'website', 'custom',
];

const METHOD_LABEL = {
  oauth: 'OAuth',
  bio_code: 'Bio-Code',
  scrape: 'Scan',
  domain_dns: 'DNS',
} as const;

const PLATFORM_TILE: Record<Platform, { bg: string; fg: string }> = {
  ebay:          { bg: 'bg-blue-600',   fg: 'text-white' },
  paypal:        { bg: 'bg-sky-700',    fg: 'text-white' },
  vinted:        { bg: 'bg-teal-600',   fg: 'text-white' },
  kleinanzeigen: { bg: 'bg-[#1D4B00]',  fg: 'text-white' },
  etsy:          { bg: 'bg-orange-700', fg: 'text-white' },
  github:        { bg: 'bg-zinc-800',   fg: 'text-white' },
  linkedin:      { bg: 'bg-sky-600',    fg: 'text-white' },
  discogs:       { bg: 'bg-zinc-700',   fg: 'text-white' },
  willhaben:     { bg: 'bg-accent',     fg: 'text-white' },
  shpock:        { bg: 'bg-yellow-500', fg: 'text-text' },
  website:       { bg: 'bg-elevated',   fg: 'text-text' },
  custom:        { bg: 'bg-elevated',   fg: 'text-text' },
};

const TIER_DOT: Record<string, string> = {
  gold: 'bg-warning',
  silver: 'bg-muted/40',
  bronze: 'bg-warning/40',
};

export function PlatformGrid() {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {PLATFORMS.map((p) => {
        const tier = PLATFORM_TIER[p];
        const tile = PLATFORM_TILE[p];
        return (
          <li key={p}>
            <Link
              href={`/dashboard/connect/${p}`}
              className="group flex items-center gap-3 rounded-lg border border-elevated bg-surface p-3 transition hover:border-muted/50"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tile.bg} ${tile.fg}`}
              >
                <PlatformIcon platform={p} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-text">
                    {PLATFORM_LABELS[p]}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${TIER_DOT[tier] ?? 'bg-muted/40'}`}
                    title={tier}
                  />
                </div>
                <p className="text-[11px] text-muted">
                  {METHOD_LABEL[PLATFORM_METHOD[p]]}
                </p>
              </div>
              <span
                aria-hidden
                className="shrink-0 text-muted/60 transition group-hover:translate-x-0.5 group-hover:text-text"
              >
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
