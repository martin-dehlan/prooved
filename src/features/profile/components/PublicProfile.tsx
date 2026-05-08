import Link from 'next/link';
import Image from 'next/image';
import type { PublicProfile as PublicProfileData } from '@/features/profile/services/profileService';
import type { Connection } from '@/features/connections/types/connection.types';
import { CopyLinkButton } from './CopyLinkButton';
import { PlatformLink } from './PlatformLink';

interface TrustStats {
  totalRatings: number;
  positivePercent: number | null;
  oldestYear: number | null;
}

function computeTrust(connections: Connection[]): TrustStats {
  let totalRatings = 0;
  let totalPositive = 0;
  let totalNegative = 0;
  let oldestMs = Infinity;

  for (const c of connections) {
    if (c.rating_count != null) totalRatings += c.rating_count;
    if (c.positive_count != null) totalPositive += c.positive_count;
    if (c.negative_count != null) totalNegative += c.negative_count;
    if (c.member_since) {
      const t = new Date(c.member_since).getTime();
      if (!Number.isNaN(t) && t < oldestMs) oldestMs = t;
    }
  }

  const totalRated = totalPositive + totalNegative;
  const positivePercent = totalRated > 0 ? (totalPositive / totalRated) * 100 : null;
  const oldestYear =
    oldestMs !== Infinity ? new Date(oldestMs).getFullYear() : null;

  return { totalRatings, positivePercent, oldestYear };
}

// Pick best avatar source — KYC-grade first.
function pickAvatar(connections: Connection[]): {
  url: string;
  source: string;
} | null {
  const order: Connection['platform'][] = ['paypal', 'linkedin', 'github'];
  for (const platform of order) {
    const c = connections.find(
      (x) => x.platform === platform && x.show_picture && x.verified_picture_url,
    );
    if (c?.verified_picture_url) {
      return { url: c.verified_picture_url, source: platform };
    }
  }
  return null;
}

// Pick name to spotlight under handle — first connection that allows it.
function pickVerifiedName(connections: Connection[]): {
  name: string;
  source: string;
} | null {
  const order: Connection['platform'][] = ['paypal', 'linkedin'];
  for (const platform of order) {
    const c = connections.find(
      (x) => x.platform === platform && x.show_name && x.verified_name,
    );
    if (c?.verified_name) {
      return { name: c.verified_name, source: platform };
    }
  }
  return null;
}

const SOURCE_LABEL: Record<string, string> = {
  paypal: 'PayPal',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

export function PublicProfile({ data }: { data: PublicProfileData }) {
  const { user, connections } = data;
  const display = user.name ?? user.slug;
  const initials =
    display
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? '')
      .join('') || user.slug[0]?.toUpperCase();

  const verifiedCount = connections.length;
  const trust = computeTrust(connections);
  const avatar = pickAvatar(connections);
  const verifiedName = pickVerifiedName(connections);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex max-w-md flex-col px-5 py-10 sm:py-14">
        <header className="flex flex-col items-center text-center">
          {avatar ? (
            <Image
              src={avatar.url}
              alt={display}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover ring-2 ring-elevated"
              referrerPolicy="no-referrer"
              unoptimized
            />
          ) : (
            <div
              aria-hidden
              className="flex h-24 w-24 items-center justify-center rounded-full bg-text text-3xl font-bold text-bg"
            >
              {initials}
            </div>
          )}
          <h1 className="mt-5 text-2xl font-bold text-text">{display}</h1>
          <p className="mt-1 text-sm text-muted">@{user.slug}</p>

          {verifiedName && (
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-text">
              <CheckIcon className="h-3.5 w-3.5 text-accent" />
              <span>
                <span className="font-medium text-text">{verifiedName.name}</span>
                <span className="text-muted">
                  {' '}
                  · laut {SOURCE_LABEL[verifiedName.source] ?? verifiedName.source}
                </span>
              </span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-semibold text-white">
              <CheckIcon className="h-3 w-3" /> {verifiedCount} verifiziert
            </span>
            {user.wallet_address && user.wallet_verified_at && (
              <a
                href={`https://explorer.solana.com/address/${user.wallet_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-surface px-3 py-1 font-medium text-text ring-1 ring-elevated hover:bg-elevated"
              >
                ◎ Wallet
              </a>
            )}
          </div>

          {(trust.totalRatings > 0 || trust.oldestYear) && (
            <dl className="mt-6 grid w-full grid-cols-3 gap-2 rounded-2xl border border-elevated bg-surface px-2 py-4 text-center">
              <Stat
                value={
                  trust.positivePercent != null
                    ? `${trust.positivePercent.toFixed(1).replace('.', ',')} %`
                    : '–'
                }
                label="positiv"
              />
              <Stat
                value={trust.totalRatings > 0 ? trust.totalRatings.toLocaleString('de-DE') : '–'}
                label="Bewertungen"
              />
              <Stat
                value={trust.oldestYear ? `seit ${trust.oldestYear}` : '–'}
                label="aktiv"
              />
            </dl>
          )}
        </header>

        <main className="mt-8 space-y-3">
          {connections.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-elevated bg-surface p-8 text-center text-sm text-muted">
              Noch keine verifizierten Plattformen.
            </p>
          ) : (
            connections.map((c) => <PlatformLink key={c.id} connection={c} />)
          )}
        </main>

        <footer className="mt-10 flex flex-col items-center gap-3">
          <CopyLinkButton slug={user.slug} />
          <Link
            href={`/${user.slug}/report`}
            className="text-sm text-muted underline-offset-4 hover:text-text hover:underline"
          >
            Profil melden
          </Link>
          <span className="mt-2 text-xs text-muted">Powered by Prooved</span>
        </footer>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 text-base font-bold text-text">{value}</dd>
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
