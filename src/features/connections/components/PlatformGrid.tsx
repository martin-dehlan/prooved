import Link from 'next/link';
import {
  PLATFORM_LABELS,
  PLATFORM_TIER,
  PLATFORM_METHOD,
} from '@/shared/types/platform.types';
import type { Platform } from '@/shared/types/platform.types';

const PLATFORMS: Platform[] = [
  'ebay', 'paypal', 'etsy', 'vinted', 'kleinanzeigen',
  'willhaben', 'shpock', 'discogs',
  'linkedin', 'github',
  'website',
];

const METHOD_LABEL = {
  oauth: 'OAuth Login',
  bio_code: 'Bio-Code',
  scrape: 'Profil-Scan',
  domain_dns: 'DNS-Record',
} as const;

const PLATFORM_GLYPH: Record<Platform, string> = {
  ebay: 'eB', paypal: 'PP', vinted: 'Vt', kleinanzeigen: 'KA',
  website: '◉', etsy: 'Et', github: 'Gh', linkedin: 'in',
  discogs: 'Dc', willhaben: 'Wh', shpock: 'Sh',
};
const PLATFORM_BG: Record<Platform, string> = {
  ebay: 'bg-blue-600',
  paypal: 'bg-sky-700',
  vinted: 'bg-teal-600',
  kleinanzeigen: 'bg-warning',
  website: 'bg-text',
  etsy: 'bg-orange-700',
  github: 'bg-zinc-800',
  linkedin: 'bg-sky-600',
  discogs: 'bg-zinc-700',
  willhaben: 'bg-accent',
  shpock: 'bg-yellow-500',
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
        return (
          <li key={p}>
            <Link
              href={`/dashboard/connect/${p}`}
              className="flex items-center gap-4 rounded-2xl border border-elevated bg-surface p-4 transition hover:-translate-y-0.5 hover:border-elevated"
            >
              <div
                aria-hidden
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${PLATFORM_BG[p]}`}
              >
                {PLATFORM_GLYPH[p]}
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
