import { PLATFORM_LABELS, PLATFORM_TIER } from '@/shared/types/platform.types';
import type { Connection } from '@/features/connections/types/connection.types';
import { PlatformIcon } from '@/shared/components/ui/PlatformIcon';
import { isSuspectMembership, formatActivity } from '@/shared/lib/profile-checks';

const PLATFORM_TILE: Record<string, { bg: string; fg: string }> = {
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
  reverb:        { bg: 'bg-orange-600', fg: 'text-white' },
  website:       { bg: 'bg-elevated',   fg: 'text-text' },
  custom:        { bg: 'bg-elevated',   fg: 'text-text' },
};

const TIER_DOT: Record<string, string> = {
  gold: 'bg-warning',
  silver: 'bg-muted/40',
  bronze: 'bg-warning/40',
};

function isClickable(c: Connection): boolean {
  if (c.platform === 'paypal') return false;
  return !!c.platform_url;
}

function formatYear(d: string | null): string | null {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) {
    const m = d.match(/(\d{4})/);
    return m ? m[1]! : null;
  }
  return String(dt.getFullYear());
}

function metricFor(c: Connection): { primary: string; secondary?: string; tone?: 'good' | 'bad' | 'neutral' } | null {
  if (c.platform === 'custom' || c.platform === 'website') {
    return {
      primary: c.platform_user_id ?? 'verifiziert',
      tone: 'good',
    };
  }
  if (c.platform === 'github') {
    const handle = c.platform_user_id ? `@${c.platform_user_id}` : '';
    const repos = c.rating_count;
    const name = c.show_name && c.verified_name ? c.verified_name : null;
    if (name) {
      return {
        primary: name,
        secondary: [handle, repos != null && repos > 0 ? `${repos} Repos` : null]
          .filter(Boolean)
          .join(' · '),
      };
    }
    if (handle) {
      return {
        primary: handle,
        secondary: repos != null && repos > 0 ? `${repos} Repos` : undefined,
      };
    }
    return { primary: 'verifiziert', tone: 'good' };
  }
  if (c.platform === 'linkedin' || c.platform === 'paypal') {
    if (c.show_name && c.verified_name) {
      return { primary: c.verified_name, tone: 'good' };
    }
    return { primary: 'Identität verifiziert', tone: 'good' };
  }
  if (c.platform === 'ebay') {
    const pos = c.positive_count ?? 0;
    const neg = c.negative_count ?? 0;
    const total = pos + neg;
    if (total >= 1) {
      const pct = (pos / total) * 100;
      const fmt = `${pct.toFixed(1).replace('.', ',')} % positiv`;
      const count = c.rating_count;
      const tone: 'good' | 'bad' | 'neutral' =
        pct >= 95 ? 'good' : pct < 80 ? 'bad' : 'neutral';
      return {
        primary: fmt,
        secondary: count != null ? `${count} Bewertungen` : undefined,
        tone,
      };
    }
    if (c.rating_count && c.rating_count > 0) {
      return { primary: `${c.rating_count} Bewertungen` };
    }
    return { primary: 'verifiziert', tone: 'good' };
  }
  // vinted / kleinanzeigen / willhaben / shpock / discogs / etsy → stars
  const score = c.rating_score;
  if (score != null && score > 0) {
    return {
      primary: `★ ${score.toFixed(1)}`,
      secondary: c.rating_count != null ? `${c.rating_count} Bewertungen` : undefined,
    };
  }
  if (c.rating_count && c.rating_count > 0) {
    return { primary: `${c.rating_count} Bewertungen` };
  }
  return { primary: 'verifiziert', tone: 'good' };
}

export function PlatformLink({ connection: c }: { connection: Connection }) {
  const tier = PLATFORM_TIER[c.platform];
  const label =
    c.platform === 'custom' && c.custom_label
      ? c.custom_label
      : PLATFORM_LABELS[c.platform];
  const clickable = isClickable(c);
  const since = formatYear(c.member_since);
  const suspect = isSuspectMembership(c);
  const activity = formatActivity(c.last_fetched);
  const metric = metricFor(c);
  const tile = PLATFORM_TILE[c.platform] ?? { bg: 'bg-elevated', fg: 'text-text' };

  const primaryTone =
    metric?.tone === 'good'
      ? 'text-accent'
      : metric?.tone === 'bad'
        ? 'text-danger'
        : 'text-text';

  const body = (
    <div className="flex items-center gap-3 rounded-lg border border-elevated bg-surface p-3 transition hover:border-muted/50">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${tile.bg} ${tile.fg}`}
      >
        <PlatformIcon platform={c.platform} size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-text">
            {label}
          </span>
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${TIER_DOT[tier] ?? 'bg-muted/40'}`}
            aria-label={tier}
            title={tier}
          />
        </div>
        {metric && (
          <div className="flex items-center gap-1.5 text-[13px] leading-tight">
            <span className={`font-medium ${primaryTone}`}>{metric.primary}</span>
            {metric.secondary && (
              <span className="truncate text-muted">· {metric.secondary}</span>
            )}
          </div>
        )}
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
          {since && (
            <span className={suspect.flagged ? 'text-warning' : ''}>
              seit {since}
              {suspect.flagged && ' ⚠'}
            </span>
          )}
          {activity && since && <span aria-hidden>·</span>}
          {activity && <span>{activity}</span>}
        </div>
      </div>

      {clickable && (
        <span
          aria-hidden
          className="shrink-0 text-muted/60 transition group-hover:translate-x-0.5 group-hover:text-text"
        >
          →
        </span>
      )}
    </div>
  );

  return (
    <li className={clickable ? 'group' : undefined}>
      {clickable ? (
        <a
          href={c.platform_url!}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {body}
        </a>
      ) : (
        body
      )}
    </li>
  );
}
