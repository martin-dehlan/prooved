import { PLATFORM_LABELS, PLATFORM_TIER } from '@/shared/types/platform.types';
import type { Connection } from '@/features/connections/types/connection.types';

const PLATFORM_GLYPH: Record<string, string> = {
  ebay: 'eB', paypal: 'PP', vinted: 'Vt', kleinanzeigen: 'KA',
  website: '◉', etsy: 'Et', github: 'Gh', linkedin: 'in',
  discogs: 'Dc', willhaben: 'Wh', shpock: 'Sh',
};

const PLATFORM_BG: Record<string, string> = {
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

function isClickable(c: Connection): boolean {
  if (c.platform === 'paypal') return false;
  return !!c.platform_url;
}

function formatYear(d: string | null): string | null {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) {
    // German "DD.MM.YYYY" fallback
    const m = d.match(/(\d{4})/);
    return m ? m[1]! : null;
  }
  return String(dt.getFullYear());
}

function formatPercent(positive: number, negative: number): string | null {
  const total = positive + negative;
  if (total === 0) return null;
  const pct = (positive / total) * 100;
  return `${pct.toFixed(1).replace('.', ',')} %`;
}

function PrimaryMetric({ c }: { c: Connection }) {
  // Website → just show domain as the trust signal
  if (c.platform === 'website') {
    return (
      <span className="font-medium text-accent">
        ✓ {c.platform_user_id ?? 'Domain verifiziert'}
      </span>
    );
  }

  // GitHub → name (if shown) + login, repos as activity signal
  if (c.platform === 'github') {
    const handle = c.platform_user_id ? `@${c.platform_user_id}` : null;
    const repos = c.rating_count;
    const showName = c.show_name && c.verified_name;
    return (
      <>
        {showName && (
          <span className="font-medium text-text">{c.verified_name}</span>
        )}
        {handle && (
          <span className="text-muted">
            {showName ? '· ' : ''}
            {handle}
          </span>
        )}
        {repos != null && repos > 0 && (
          <span className="text-muted">· {repos} Repos</span>
        )}
        {!showName && !handle && (
          <span className="font-medium text-accent">✓ Verifiziert</span>
        )}
      </>
    );
  }

  // LinkedIn → KYC name (if shown)
  if (c.platform === 'linkedin') {
    if (c.show_name && c.verified_name) {
      return (
        <span className="font-medium text-accent">
          ✓ {c.verified_name}
        </span>
      );
    }
    return <span className="font-medium text-accent">✓ Identität verifiziert</span>;
  }

  // PayPal → KYC name as trust signal (no rating data on PayPal)
  if (c.platform === 'paypal') {
    if (c.show_name && c.verified_name) {
      return (
        <span className="font-medium text-accent">
          ✓ {c.verified_name}
        </span>
      );
    }
    return <span className="font-medium text-accent">✓ Identität verifiziert</span>;
  }

  // eBay → % positiv (native trust metric)
  if (c.platform === 'ebay') {
    const pos = c.positive_count ?? 0;
    const neg = c.negative_count ?? 0;
    const pct = formatPercent(pos, neg);
    if (pct) {
      return (
        <>
          <span className="font-semibold text-text">{pct} positiv</span>
          {c.rating_count != null && (
            <span className="text-muted">· {c.rating_count} Bewertungen</span>
          )}
        </>
      );
    }
    if (c.rating_count && c.rating_count > 0) {
      return <span className="font-medium text-text">{c.rating_count} Bewertungen</span>;
    }
    return <span className="font-medium text-accent">✓ Identität verifiziert</span>;
  }

  // Vinted / Kleinanzeigen → stars
  const score = c.rating_score;
  if (score != null && score > 0) {
    return (
      <>
        <span className="font-semibold text-text">★ {score.toFixed(1)}</span>
        {c.rating_count != null && (
          <span className="text-muted">· {c.rating_count} Bewertungen</span>
        )}
      </>
    );
  }
  if (c.rating_count && c.rating_count > 0) {
    return <span className="font-medium text-text">{c.rating_count} Bewertungen</span>;
  }
  return <span className="font-medium text-accent">✓ Identität verifiziert</span>;
}

export function PlatformLink({ connection: c }: { connection: Connection }) {
  const tier = PLATFORM_TIER[c.platform];
  const label = PLATFORM_LABELS[c.platform];
  const clickable = isClickable(c);
  const since = formatYear(c.member_since);

  const inner = (
    <>
      <div
        aria-hidden
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${PLATFORM_BG[c.platform] ?? 'bg-text'}`}
      >
        {PLATFORM_GLYPH[c.platform] ?? '?'}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-text">
            {label}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TIER_PILL[tier]}`}
          >
            {tier}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
          <PrimaryMetric c={c} />
        </div>
        {since && (
          <p className="mt-0.5 text-xs text-muted">Mitglied seit {since}</p>
        )}
      </div>

      {clickable && (
        <span
          aria-hidden
          className="text-muted transition group-hover:translate-x-0.5 group-hover:text-text"
        >
          →
        </span>
      )}
    </>
  );

  if (clickable) {
    return (
      <a
        href={c.platform_url!}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4 rounded-2xl border border-elevated bg-surface p-4 transition hover:-translate-y-0.5 hover:border-elevated hover:shadow-sm"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-elevated bg-surface p-4">
      {inner}
    </div>
  );
}
