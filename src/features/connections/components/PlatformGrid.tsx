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
  oauth: 'OAuth Login',
  bio_code: 'Bio-Code',
  scrape: 'Profil-Scan',
  domain_dns: 'DNS-Record',
} as const;

// Brand-color tile bg + icon-color combos.
// Brand-strong platforms get colored tile w/ white icon.
// Conceptual platforms (website, custom) get neutral tile.
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

const TIER_PILL: Record<string, string> = {
  gold: 'bg-warning text-text',
  silver: 'bg-elevated text-text',
  bronze: 'bg-warning/30 text-warning',
};

export function PlatformGrid() {
  return (
    <ul className="space-y-2">
      {PLATFORMS.map((p) => {
        const tier = PLATFORM_TIER[p];
        const tile = PLATFORM_TILE[p];
        return (
          <li key={p}>
            <Link
              href={`/dashboard/connect/${p}`}
              className="flex items-center gap-4 rounded-2xl border border-elevated bg-surface p-4 transition hover:-translate-y-0.5 hover:border-muted"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tile.bg} ${tile.fg}`}
              >
                <PlatformIcon platform={p} size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text">
                    {PLATFORM_LABELS[p]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TIER_PILL[tier]}`}
                  >
                    {tier}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {METHOD_LABEL[PLATFORM_METHOD[p]]}
                </p>
              </div>
              <span aria-hidden className="text-muted">
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
