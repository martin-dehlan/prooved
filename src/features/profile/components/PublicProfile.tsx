import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { PublicProfile as PublicProfileData } from '@/features/profile/services/profileService';
import type { Connection } from '@/features/connections/types/connection.types';
import { computeTrust, type Tier, type Locale } from '@/shared/lib/trust';
import {
  checkNameConsistency,
  formatMonthYear,
} from '@/shared/lib/profile-checks';
import { CopyLinkButton } from './CopyLinkButton';
import { PlatformLink } from './PlatformLink';

const SOURCE_LABEL: Record<string, string> = {
  paypal: 'PayPal',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

function pickAvatar(
  connections: Connection[],
  preference: string | null,
): { url: string } | null {
  if (preference === 'none') return null;
  if (preference === 'paypal' || preference === 'linkedin' || preference === 'github') {
    const c = connections.find(
      (x) => x.platform === preference && x.show_picture && x.verified_picture_url,
    );
    return c?.verified_picture_url ? { url: c.verified_picture_url } : null;
  }
  const order: Connection['platform'][] = ['paypal', 'linkedin', 'github'];
  for (const platform of order) {
    const c = connections.find(
      (x) => x.platform === platform && x.show_picture && x.verified_picture_url,
    );
    if (c?.verified_picture_url) return { url: c.verified_picture_url };
  }
  return null;
}

function pickVerifiedName(connections: Connection[]): {
  name: string;
  source: string;
} | null {
  const order: Connection['platform'][] = ['paypal', 'linkedin'];
  for (const platform of order) {
    const c = connections.find(
      (x) => x.platform === platform && x.show_name && x.verified_name,
    );
    if (c?.verified_name) return { name: c.verified_name, source: platform };
  }
  return null;
}

function oldestYear(connections: Connection[]): number | null {
  let oldest = Infinity;
  for (const c of connections) {
    if (!c.member_since) continue;
    const t = new Date(c.member_since).getTime();
    if (!Number.isNaN(t) && t < oldest) oldest = t;
  }
  return oldest === Infinity ? null : new Date(oldest).getFullYear();
}

export async function PublicProfile({
  data,
  isOwner = false,
}: {
  data: PublicProfileData;
  isOwner?: boolean;
}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('PublicProfile');
  const { user, connections } = data;
  const display = user.name ?? user.slug;
  const initials =
    display
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? '')
      .join('') || user.slug[0]?.toUpperCase();

  const score = computeTrust({ connections, locale });
  const avatar = pickAvatar(connections, user.avatar_source);
  const verifiedName = pickVerifiedName(connections);
  const nameCheck = checkNameConsistency(connections);
  const proovedSince = formatMonthYear(user.created_at, locale);
  const activeSince = oldestYear(connections);

  const warnings: { kind: 'danger' | 'warning'; text: string }[] = [];
  if (score.qualityCapped) {
    warnings.push({ kind: 'danger', text: t('warningQualityCap') });
  }
  if (nameCheck.hasMismatch) {
    warnings.push({
      kind: 'warning',
      text: t('warningNameMismatch', { count: nameCheck.names.length }),
    });
  }

  return (
    <div className="min-h-screen bg-bg">
      {isOwner && <OwnerBar yourProfile={t('yourProfile')} dashboardLink={t('dashboardLink')} />}

      <div className="mx-auto max-w-md px-5 py-8 sm:py-12">
        <header className="flex items-center gap-4">
          {avatar ? (
            <Image
              src={avatar.url}
              alt={display}
              width={72}
              height={72}
              className="h-[72px] w-[72px] rounded-full object-cover"
              referrerPolicy="no-referrer"
              unoptimized
            />
          ) : (
            <div
              aria-hidden
              className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-text text-2xl font-semibold text-bg"
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold text-text sm:text-2xl">
              {display}
            </h1>
            <p className="truncate text-sm text-muted">
              @{user.slug}
              {proovedSince && (
                <span className="text-muted/70"> · {t('since', { date: proovedSince })}</span>
              )}
            </p>
            {verifiedName && (
              <p className="mt-1 flex items-center gap-1 text-xs text-text">
                <CheckIcon className="h-3 w-3 text-accent" />
                <span className="truncate">
                  {verifiedName.name}
                  <span className="text-muted">
                    {' '}
                    · {t('verifiedSuffix', { platform: SOURCE_LABEL[verifiedName.source] ?? verifiedName.source })}
                  </span>
                </span>
              </p>
            )}
          </div>
        </header>

        <ScoreInline score={score} warnings={warnings} hintOne={t('hintOne')} hintMany={t('hintMany')} />

        {(score.totalRatings > 0 || score.aggregatePositivePct != null || activeSince) && (
          <div className="mt-5 grid grid-cols-3 gap-2 border-y border-elevated py-4 text-center">
            <PercentMini pct={score.aggregatePositivePct} label={t('positive')} locale={locale} />
            <Mini
              value={
                score.totalRatings > 0
                  ? score.totalRatings.toLocaleString(locale === 'en' ? 'en-US' : 'de-DE')
                  : '–'
              }
              label={t('ratings')}
            />
            <Mini
              value={activeSince ? String(activeSince) : '–'}
              label={activeSince ? t('activeSince') : t('active')}
            />
          </div>
        )}

        <h2 className="mt-8 mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          {t('platformsHeading')}
        </h2>
        {connections.length === 0 ? (
          <p className="rounded-lg border border-dashed border-elevated bg-surface p-6 text-center text-sm text-muted">
            {t('noPlatforms')}
          </p>
        ) : (
          <ul className="space-y-2">
            {connections.map((c) => (
              <PlatformLink key={c.id} connection={c} locale={locale} />
            ))}
          </ul>
        )}

        <ScoreBreakdown
          score={score}
          title={t('scoreBreakdown')}
          footer={t('scoreFooter')}
          learnMore={t('learnMore')}
        />

        <footer className="mt-12 flex flex-col items-center gap-4 text-xs text-muted">
          <CopyLinkButton slug={user.slug} />
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link
              href={`/${user.slug}/report`}
              className="hover:text-text hover:underline"
            >
              {t('report')}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/how-it-works" className="hover:text-text hover:underline">
              {t('whatIsProoved')}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/privacy" className="hover:text-text hover:underline">
              {t('privacy')}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="hover:text-text hover:underline">
              {t('terms')}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/imprint" className="hover:text-text hover:underline">
              {t('imprint')}
            </Link>
          </nav>
          <span className="text-muted/60">{t('poweredBy')}</span>
        </footer>
      </div>
    </div>
  );
}

function OwnerBar({ yourProfile, dashboardLink }: { yourProfile: string; dashboardLink: string }) {
  return (
    <div className="sticky top-0 z-10 border-b border-elevated bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-2 text-xs">
        <span className="text-muted">{yourProfile}</span>
        <Link
          href="/dashboard"
          className="font-medium text-accent hover:underline"
        >
          {dashboardLink}
        </Link>
      </div>
    </div>
  );
}

const TIER_BG: Record<Tier, string> = {
  neu: 'bg-elevated',
  bronze: 'bg-warning/30',
  silver: 'bg-elevated',
  gold: 'bg-warning',
  diamond: 'bg-accent',
};
const TIER_TEXT: Record<Tier, string> = {
  neu: 'text-muted',
  bronze: 'text-warning',
  silver: 'text-text',
  gold: 'text-bg',
  diamond: 'text-white',
};
const TIER_BAR: Record<Tier, string> = {
  neu: 'bg-muted',
  bronze: 'bg-warning',
  silver: 'bg-text/60',
  gold: 'bg-warning',
  diamond: 'bg-accent',
};

function ScoreInline({
  score,
  warnings,
  hintOne,
  hintMany,
}: {
  score: ReturnType<typeof computeTrust>;
  warnings: { kind: 'danger' | 'warning'; text: string }[];
  hintOne: string;
  hintMany: string;
}) {
  const hasDanger = warnings.some((w) => w.kind === 'danger');
  const tone = hasDanger ? 'text-danger' : 'text-warning';
  const accent = hasDanger ? 'border-danger/40' : 'border-warning/40';

  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-center gap-3">
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TIER_BG[score.tier]} ${TIER_TEXT[score.tier]}`}
        >
          {score.tierLabel}
        </span>
        <div className="min-w-0 flex-1">
          <div className="h-1 overflow-hidden rounded-full bg-elevated">
            <div
              className={`h-full rounded-full transition-all ${TIER_BAR[score.tier]}`}
              style={{ width: `${score.total}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 tabular-nums text-sm font-semibold text-text">
          {score.total}
          <span className="text-muted">/100</span>
        </span>
      </div>

      {warnings.length > 0 && (
        <details className="group">
          <summary
            className={`flex cursor-pointer list-none items-center gap-1.5 text-[11px] ${tone} hover:opacity-80`}
          >
            <span aria-hidden className="text-[10px]">⚠</span>
            <span>
              {warnings.length} {warnings.length === 1 ? hintOne : hintMany}
            </span>
            <span
              aria-hidden
              className="text-muted/60 transition-transform group-open:rotate-180"
            >
              ⌄
            </span>
          </summary>
          <ul className={`mt-1.5 space-y-1 border-l-2 ${accent} pl-3 text-[11px]`}>
            {warnings.map((w, i) => (
              <li key={i} className={w.kind === 'danger' ? 'text-danger' : 'text-warning'}>
                {w.text}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function ScoreBreakdown({
  score,
  title,
  footer,
  learnMore,
}: {
  score: ReturnType<typeof computeTrust>;
  title: string;
  footer: string;
  learnMore: string;
}) {
  return (
    <details className="group mt-6 text-sm">
      <summary className="flex cursor-pointer items-center justify-between rounded-md py-2 text-xs text-muted hover:text-text">
        <span>{title}</span>
        <span className="transition group-open:rotate-180" aria-hidden>
          ⌄
        </span>
      </summary>
      <div className="mt-2 space-y-3 rounded-lg border border-elevated bg-surface p-4">
        {score.components
          .filter((c) => c.id !== 'penalty' || c.earned !== 0)
          .map((c) => (
            <div key={c.id} className="space-y-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted">{c.label}</span>
                <span className="tabular-nums font-medium text-text">
                  {c.earned > 0 ? '+' : ''}
                  {c.earned}
                  {c.max > 0 && <span className="text-muted">/{c.max}</span>}
                </span>
              </div>
              {c.max > 0 && (
                <div className="h-0.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{
                      width: `${Math.max(0, (c.earned / c.max) * 100)}%`,
                    }}
                  />
                </div>
              )}
              {c.detail.length > 0 && (
                <ul className="space-y-0.5 pt-1 text-[11px] text-muted">
                  {c.detail.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        <p className="border-t border-elevated pt-3 text-[11px] text-muted">
          {footer}{' '}
          <Link href="/how-it-works" className="underline">
            {learnMore}
          </Link>
        </p>
      </div>
    </details>
  );
}

function Mini({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-base font-semibold text-text tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

function PercentMini({
  pct,
  label,
  locale,
}: {
  pct: number | null;
  label: string;
  locale: Locale;
}) {
  if (pct == null) return <Mini value="–" label={label} />;
  let cls = 'text-text';
  if (pct < 50) cls = 'text-danger';
  else if (pct < 90) cls = 'text-warning';
  else if (pct >= 95) cls = 'text-accent';
  const fmt =
    locale === 'en' ? `${pct.toFixed(1)}%` : `${pct.toFixed(1).replace('.', ',')} %`;
  return (
    <div>
      <div className={`text-base font-semibold tabular-nums ${cls}`}>{fmt}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className={className}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
